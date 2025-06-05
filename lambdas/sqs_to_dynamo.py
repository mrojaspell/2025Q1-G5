import os
import json
import boto3
import logging
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

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
        endpoint_url=os.getenv("DYNAMODB_ENDPOINT")
    )
else:
    # AWS: use IAM task role or default chain
    # No need for credentials, will use IAM role or default chain
    # if running in AWS Lambda or ECS
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
    )

TABLE_NAME = os.getenv("DYNAMO_TABLE", "unimart-products")
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, _):
    total = len(event["Records"])
    written = 0
    skipped = 0

    with table.batch_writer(overwrite_by_pkeys=["ean", "SK"]) as batch:
        for record in event["Records"]:
            try:
                item = json.loads(record["body"])

                ean = item.get("ean")
                store = item.get("store")
                price_raw = item.get("price")
                date = item.get("date", datetime.now(timezone.utc).date().isoformat())
                link = item.get("link")

                if not (ean and store and price_raw):
                    logger.warning(f"[SQS-TO-DYNAMO] Missing required fields in item: {item}")
                    skipped += 1
                    continue

                try:
                    price = Decimal(str(price_raw))
                except (InvalidOperation, ValueError):
                    logger.warning(f"[SQS-TO-DYNAMO] Invalid price format: {price_raw}")
                    skipped += 1
                    continue

                meta_fields = {
                    "name": item.get("name"),
                    "brand": item.get("brand"),
                    "image": item.get("image"),
                    "category": item.get("category"),
                }

                # NOTE: Aca se escribe siempre la metadata con los datos que llegan
                # Creo que asi es mas barato y rapido porque no hay que checkear
                batch.put_item(Item={"ean": ean, "SK": "meta", **meta_fields})

                # Write last price + historic entry
                batch.put_item(Item={"ean": ean, "SK": f"last#{store}", "price": price, "date": date, "link": link})
                batch.put_item(Item={"ean": ean, "SK": f"price#{store}#{date}", "price": price})

                logger.debug(f"[SQS-TO-DYNAMO] Stored {ean} for {store}")
                written += 1

            except Exception as e:
                logger.exception(f"[SQS-TO-DYNAMO] Error processing record: {e}")
                skipped += 1

    logger.info(f"[SQS-TO-DYNAMO] Batch summary: {total} records received, {written} written, {skipped} skipped.")

