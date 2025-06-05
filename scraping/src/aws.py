import json
import boto3
from botocore.exceptions import ClientError

DYNAMO_TABLE_NAME = "unimart-products"
BATCH_SIZE = 25


dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(DYNAMO_TABLE_NAME)

def preprocess_item(item: dict) -> dict:
    # Add lowercase name for name-based GSI
    item["name_key"] = item.get("name", "").lower()
    return item

def chunked(iterable, size):
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

def load_json_to_dynamodb(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Loaded {len(products)} products from JSON.")

    for i, batch in enumerate(chunked(products, BATCH_SIZE), start=1):
        print(f"Uploading batch {i}...")
        with table.batch_writer(overwrite_by_pkeys=["ean"]) as batch_writer:
            for item in batch:
                try:
                    batch_writer.put_item(Item=preprocess_item(item))
                except ClientError as e:
                    print(f"Failed to write item {item.get('ean')}: {e}")

    print("Upload completed.")

def upload_to_s3(filepath: str, bucket: str, key="products.json"):
    s3 = boto3.client("s3")
    with open(filepath, "rb") as f:
        s3.upload_fileobj(f, bucket, key)
    print(f"Uploaded {filepath} to s3://{bucket}/{key}")

