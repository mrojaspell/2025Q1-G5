import logging
import sys
from fastapi import FastAPI, HTTPException, Request, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Local modules
from typesense import search_typesense
from dynamo import get_historical_prices_grouped, get_full_product, get_product_metadata, get_user_cart, upsert_user_cart
from cognito import get_current_user

# ---------------------------
# Logging Configuration
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("unimart-api")

# ---------------------------
# App Initialization
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Endpoints
# ---------------------------
@app.get("/health")
def root():
    logger.info("Health check endpoint hit")
    return {"status": "ok"}


@app.post("/api/search/multi_search")
async def search(request: Request):
    logger.info("Received multi_search request")
    return await search_typesense(request)

@app.get("/api/products/{ean}/")
def fetch_product_by_ean(ean: str):
    logger.info(f"Fetching product with EAN: {ean}")
    product = get_full_product(ean)
    if not product:
        logger.warning(f"Product not found: {ean}")
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/products/{ean}/history")
async def get_product_history_grouped(ean: str, store: Optional[str] = None):
    logger.info(f"Fetching price history for EAN: {ean}, store: {store}")
    product = get_product_metadata(ean)
    if not product:
        logger.warning(f"Product metadata not found: {ean}")
        raise HTTPException(status_code=404, detail="Product not found")

    history = get_historical_prices_grouped(ean, store=store)
    return history

@app.get("/api/carts/me")
def fetch_user_cart(user=Depends(get_current_user)):
    user_id = user["sub"]  # or "username", depending on your setup
    logger.info(f"Fetching cart for authenticated user {user_id}")
    cart = get_user_cart(user_id)
    return {"user_id": user_id, "items": cart}


@app.post("/api/carts/me")
def update_user_cart(items: list[dict] = Body(...), user=Depends(get_current_user) ):
    user_id = user["sub"]  # or "username", depending on your setup
    
    logger.info(f"API call: update cart for user_id={user_id}, items={items}")
    if not isinstance(items, list) or not all("ean" in i and "count" in i for i in items):
        raise HTTPException(status_code=400, detail="Invalid cart format. Must be list of {ean, count}")

    # Validate that count is a positive integer
    for item in items:
        if not isinstance(item.get("count"), int) or item["count"] <= 0:
            raise HTTPException(status_code=400, detail="Invalid count. Must be a positive integer")
        if not isinstance(item.get("ean"), str) or not item["ean"]:
            raise HTTPException(status_code=400, detail="Invalid EAN. Must be a non-empty string")

    # Check all items exist in the database
    for item in items:
        if not get_product_metadata(item["ean"]):
            logger.warning(f"Product not found for EAN: {item['ean']}")
            raise HTTPException(status_code=404, detail=f"Product not found for EAN: {item['ean']}")

    
    upsert_user_cart(user_id, items)
    return {"status": "success", "message": "Cart updated"}
