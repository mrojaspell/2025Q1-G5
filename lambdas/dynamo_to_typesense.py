import logging
import json
import urllib.request
import urllib.error
import os
import boto3
from boto3.dynamodb.conditions import Key

# Setup
logger = logging.getLogger()
logger.setLevel(logging.INFO)

is_localstack = os.getenv("DYNAMODB_ENDPOINT") is not None

if is_localstack:
    # LocalStack: use dummy credentials
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id="test",
        aws_secret_access_key="test",
        endpoint_url=os.getenv("DYNAMODB_ENDPOINT"),
    )
else:
    # AWS: use IAM task role or default chain
    # No need for credentials, will use IAM role or default chain
    # if running in AWS Lambda or ECS
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
    )

table = dynamodb.Table(os.getenv("DYNAMO_TABLE", "unimart-products"))

# Typesense HTTP API config
TYPESENSE_HOST = os.getenv("TYPESENSE_HOST")
TYPESENSE_PORT = os.getenv("TYPESENSE_PORT", "8108")
TYPESENSE_API_KEY = os.getenv("TYPESENSE_API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "products")

collection_schema = {
    "name": COLLECTION_NAME,
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "ean", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "image", "type": "string"},
        {"name": "brand", "type": "string", "facet": True},
        {"name": "category", "type": "string", "facet": True},
        {"name": "best_price", "type": "float", "facet": True},
        {"name": "best_store", "type": "string", "facet": True},
        {"name": "amount_stores", "type": "int32", "facet": True}
    ],
    "default_sorting_field": "best_price",
    "sortable_attributes": ["best_price", "amount_stores"]
}

def ensure_collection_exists():
    url = f"http://{TYPESENSE_HOST}:{TYPESENSE_PORT}/collections/{COLLECTION_NAME}"
    headers = {
        "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY
    }

    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                logger.info(f"Collection '{COLLECTION_NAME}' already exists.")
                return
    except urllib.error.HTTPError as e:
        if e.code == 404:
            logger.info(f"Collection '{COLLECTION_NAME}' not found. Creating collection...")
            create_url = f"http://{TYPESENSE_HOST}:{TYPESENSE_PORT}/collections"
            create_headers = {
                "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
                "Content-Type": "application/json"
            }
            create_data = json.dumps(collection_schema).encode("utf-8")
            create_req = urllib.request.Request(create_url, data=create_data, headers=create_headers, method="POST")
            try:
                with urllib.request.urlopen(create_req) as create_response:
                    if create_response.status == 201:
                        logger.info(f"Successfully created collection: {COLLECTION_NAME}")
                    else:
                        logger.error(f"Failed to create collection: {create_response.status}")
            except Exception as create_exception:
                logger.exception(f"Exception during collection creation: {create_exception}")
        else:
            logger.error(f"HTTP Error: {e.code}")
    except Exception as ex:
        logger.exception(f"Exception during collection existence check: {ex}")


def build_document(ean: str):
    # Fetch all last# price entries
    response = table.query(
        KeyConditionExpression=Key("ean").eq(ean) & Key("SK").begins_with("last#")
    )
    last_prices = response.get("Items", [])
    if not last_prices:
        return None

    # Determine best price
    best_price = None
    best_store = None
    store_count = 0
    for item in last_prices:
        try:
            price = float(item["price"])
            store = item["SK"].split("#")[1]
            store_count += 1
            if best_price is None or price < best_price:
                best_price = price
                best_store = store
        except Exception:
            continue

    # Fetch metadata
    meta = table.get_item(Key={"ean": ean, "SK": "meta"}).get("Item")
    if not meta:
        return None

    return {
        "id": ean,
        "ean": ean,
        "name": meta.get("name"),
        "brand": meta.get("brand"),
        "category": meta.get("category"),
        "image": meta.get("image"),
        "best_price": best_price,
        "best_store": best_store,
        "amount_stores": store_count,
    }

    
def lambda_handler(event, _):
    ensure_collection_exists()
    documents = []

    for record in event["Records"]:
        try:
            if record.get("eventName") != "INSERT":
                continue

            new_image = record.get("dynamodb", {}).get("NewImage", {})
            sk = new_image.get("SK", {}).get("S")
            ean = new_image.get("ean", {}).get("S")

            if not sk or not ean:
                logger.warning(f"[DYNAMO-TO-TYPESENSE] Missing SK or EAN: {record}")
                continue

            if sk.startswith("last#"):
                logger.debug(f"[DYNAMO-TO-TYPESENSE] Processing last# price for {ean}")
                document = build_document(ean)
                logger.debug(f"[DYNAMO-TO-TYPESENSE] Document for {ean}: {document}")
                if document:
                    documents.append(document)
                else:
                    logger.warning(f"[DYNAMO-TO-TYPESENSE] Skipping {ean}, missing data")

        except Exception:
            logger.exception("[DYNAMO-TO-TYPESENSE] Error processing record")



        if documents:
            try:
                logger.info(f"[DYNAMO-TO-TYPESENSE] Upserting {len(documents)} documents...")

                jsonl_payload = '\n'.join(json.dumps(doc) for doc in documents)
                url = f"http://{TYPESENSE_HOST}:{TYPESENSE_PORT}/collections/{COLLECTION_NAME}/documents/import?action=upsert&batch_size=100"
                headers = {
                    "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
                    "Content-Type": "text/plain"
                }

                req = urllib.request.Request(
                    url,
                    data=jsonl_payload.encode("utf-8"),
                    headers=headers,
                    method="POST"
                )

                with urllib.request.urlopen(req) as response:
                    body = response.read().decode("utf-8")
                    logger.info(f"[DYNAMO-TO-TYPESENSE] Batch upsert complete: {body}")

            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8")
                logger.error(f"[DYNAMO-TO-TYPESENSE] HTTP Error {e.code}: {error_body}")
            except Exception:
                logger.exception("[DYNAMO-TO-TYPESENSE] Exception during Typesense upsert")
