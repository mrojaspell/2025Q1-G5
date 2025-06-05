import os
import json
import urllib.request
import boto3

def handler(event, context):
    region      = os.environ.get("AWS_REGION", boto3.Session().region_name)
    pool_id     = os.environ["USER_POOL_ID"]
    bucket_name = os.environ["JWKS_BUCKET"]
    key_name    = os.environ.get("JWKS_KEY", "jwks.json")

    jwks_url = (
        f"https://cognito-idp.{region}.amazonaws.com/"
        f"{pool_id}/.well-known/jwks.json"
    )

    # fetch
    with urllib.request.urlopen(jwks_url) as resp:
        jwks = resp.read()

    # write
    boto3.client("s3").put_object(
        Bucket=bucket_name,
        Key=key_name,
        Body=jwks,
        ContentType="application/json"
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "JWKS refreshed", "key": key_name})
    }