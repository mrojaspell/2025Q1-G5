import os
import json
import time
import logging
import boto3
from jose import jwt, JWTError
from fastapi import HTTPException, Request

logger = logging.getLogger("cognito")
logger.setLevel(logging.INFO)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
JWKS_BUCKET = os.getenv("JWKS_BUCKET")
JWKS_OBJECT_KEY = os.getenv("JWKS_OBJECT_KEY", "jwks.json")
JWKS_CACHE_TTL = 600

COGNITO_USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")

DEV_MODE = os.getenv("DYNAMODB_ENDPOINT") is not None
MOCK_USER = {"sub": "dev-user-123", "email": "dev@example.com", "username": "dev-user"}

_s3 = boto3.client("s3", region_name=AWS_REGION)
_JWKS = {"keys": []}
_CACHE_TS = 0


def _refresh_jwks():
    global _JWKS, _CACHE_TS
    obj = _s3.get_object(Bucket=JWKS_BUCKET, Key=JWKS_OBJECT_KEY)
    _JWKS = json.loads(obj["Body"].read())
    _CACHE_TS = time.time()


def _get_jwks() -> dict:
    if time.time() - _CACHE_TS > JWKS_CACHE_TTL or not _JWKS["keys"]:
        _refresh_jwks()
    return _JWKS


def verify_cognito_jwt(token: str):
    try:
        header = jwt.get_unverified_header(token)
        jwks = _get_jwks()

        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            _refresh_jwks()
            key = next((k for k in _JWKS["keys"] if k["kid"] == header["kid"]), None)
            if not key:
                raise ValueError("Signing key not found in JWKS")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}",
        )

        if payload.get("token_use") != "access":
            raise ValueError("Not an access token")

        if payload.get("client_id") != COGNITO_APP_CLIENT_ID:
            raise ValueError("Invalid client_id in access token")

        return payload

    except JWTError as e:
        logger.error(f"Access token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid access token")


def get_current_user(request: Request):
    if DEV_MODE:
        return MOCK_USER

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header"
        )

    token = auth_header.split(" ")[1]
    return verify_cognito_jwt(token)
