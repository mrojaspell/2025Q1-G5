import os
import logging
from collections import defaultdict

import boto3
from boto3.dynamodb.conditions import Key

# ---------------------------
# Logging Configuration
# ---------------------------
logger = logging.getLogger("dynamo")
logger.setLevel(logging.INFO)

# ---------------------------
# DynamoDB Setup
# ---------------------------
REGION = os.getenv("AWS_REGION", "us-east-1")
PRODUCTS_TABLE_NAME = os.getenv("PRODUCTS_TABLE_NAME", "unimart-products")
CARTS_TABLE_NAME = os.getenv("CARTS_TABLE_NAME", "unimart-carts")
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")

if DYNAMODB_ENDPOINT:
    # LocalStack: use dummy credentials
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        endpoint_url=os.getenv("DYNAMODB_ENDPOINT"),
        aws_access_key_id="test",
        aws_secret_access_key="test"
    )
else:
    # AWS: use IAM roles or default credential chain
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1")
    )

products_table = dynamodb.Table(PRODUCTS_TABLE_NAME)
carts_table = dynamodb.Table(CARTS_TABLE_NAME)

# ---------------------------
# Products
# ---------------------------
def get_product_metadata(ean: str) -> dict | None:
    logger.info(f"Fetching product metadata for EAN: {ean}")
    try:
        response = products_table.get_item(Key={"ean": ean, "SK": "meta"})
        return response.get("Item")
    except Exception as e:
        logger.exception(f"Error fetching metadata for EAN: {ean}")
        return None


def get_last_prices(ean: str) -> list[dict]:
    logger.info(f"Fetching last prices for EAN: {ean}")
    try:
        response = products_table.query(
            KeyConditionExpression=Key("ean").eq(ean) & Key("SK").begins_with("last#")
        )
        return response.get("Items", [])
    except Exception as e:
        logger.exception(f"Error fetching last prices for EAN: {ean}")
        return []


def get_historical_prices(ean: str, store: str | None = None) -> list[dict]:
    logger.info(f"Fetching historical prices for EAN: {ean}, store: {store}")
    try:
        prefix = "price#" + store if store else "price#"
        response = products_table.query(
            KeyConditionExpression=Key("ean").eq(ean) & Key("SK").begins_with(prefix)
        )
        return response.get("Items", [])
    except Exception as e:
        logger.exception(f"Error fetching historical prices for EAN: {ean}, store: {store}")
        return []


def parse_last_price(item):
    try:
        _, store = item["SK"].split("#")
        return {
            "store": store,
            "price": item["price"],
            "date": item["date"],
            "link": item["link"]
        }
    except Exception as e:
        logger.warning(f"Invalid SK format in last price item: {item}")
        return {}


def get_full_product(ean: str) -> dict | None:
    logger.info(f"Building full product object for EAN: {ean}")
    meta = get_product_metadata(ean)
    if not meta:
        logger.warning(f"No metadata found for EAN: {ean}")
        return None

    last_raw = get_last_prices(ean)
    prices = [parse_last_price(item) for item in last_raw if item]

    return {
        "ean": ean,
        "name": meta["name"],
        "brand": meta["brand"],
        "image": meta["image"],
        "category": meta["category"],
        "prices": prices,
    }


def get_historical_prices_grouped(ean: str, store: str | None = None) -> list[dict]:
    logger.info(f"Grouping historical prices for EAN: {ean}, store: {store}")
    prices = get_historical_prices(ean, store)
    grouped = defaultdict(list)

    for price in prices:
        try:
            _, store, date = price["SK"].split("#")
            grouped[store].append({
                "date": date,
                "price": price["price"]
            })
        except ValueError:
            logger.warning(f"Skipping malformed SK: {price.get('SK')}")
            continue

    return [{"store": store, "prices": prices} for store, prices in grouped.items()]


# ---------------------------
# Carts
# ---------------------------

def upsert_user_cart(user_id: str, items: list[dict]):
    logger.info(f"Upserting cart for user: {user_id} with {len(items)} items")
    try:
        carts_table.put_item(
            Item={
                "user_id": user_id,
                "SK": "cart",
                "items": items
            }
        )
        logger.info(f"Cart updated successfully for user: {user_id}")
    except Exception as e:
        logger.exception(f"Error updating cart for user: {user_id}")


def get_user_cart(user_id: str) -> list[dict]:
    logger.info(f"Fetching cart for user: {user_id}")
    try:
        response = carts_table.get_item(Key={"user_id": user_id, "SK": "cart"})
        return response.get("Item", {}).get("items", [])
    except Exception as e:
        logger.exception(f"Error fetching cart for user: {user_id}")
        return []
