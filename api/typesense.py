import os
import logging
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse
import httpx
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logger
logger = logging.getLogger("typesense")
logger.setLevel(logging.INFO)

TYPESENSE_HOST = os.getenv("TYPESENSE_HOST", "localhost")
TYPESENSE_PORT = os.getenv("TYPESENSE_PORT", "8108")
TYPESENSE_URL  = f"http://{TYPESENSE_HOST}:{TYPESENSE_PORT}"


TYPESENSE_API_KEY = os.getenv("TYPESENSE_API_KEY", "xyz")
COLLECTION_NAME = os.getenv("TYPESENSE_COLLECTION_NAME", "products")

async def search_typesense(request: Request):
    try:
        query_params = dict(request.query_params)
        logger.info(f"Received multi_search request with query: {query_params}")

        body = await request.body()
        headers = {
            "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{TYPESENSE_URL}/multi_search",
                content=body,
                headers=headers,
                params=query_params
            )

        logger.info(f"Typesense responded with status {response.status_code}")
        return JSONResponse(status_code=response.status_code, content=response.json())

    except Exception as e:
        logger.exception(f"Search request failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
