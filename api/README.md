# Unimart Product API

A FastAPI backend for querying supermarket product data. It integrates:

- **DynamoDB**: stores product metadata, price history and user carts
- **Typesense**: provides full-text product search
- **Cognito**: validates jwt tokens sent by clients

---

## Features

- Search products via `/multi_search` (Typesense)
- Retrieve product details by EAN
- View historical price data grouped by store
- Set and view user product carts

---

## Setup

### 1. Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Create a `.env` file

```dotenv
# .env
# DynamoDB
AWS_REGION=us-east-1
PRODUCTS_TABLE_NAME=unimart-products
CARTS_TABLE_NAME=unimart-carts
DYNAMODB_ENDPOINT=http://localhost:4566  # If using LocalStack

# Cognito
COGNITO_USERPOOL_ID=userpool-id
COGNITO_APP_CLIENT_ID=appclient-id
JWKS_BUCKET=unimart-jwks
JWKS_OBJECT_KEY=jwks.json

# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8081
TYPESENSE_API_KEY=xyz
TYPESENSE_COLLECTION_NAME=products
```

---

## Run the API

```bash
# Attached to terminal session
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Detached from terminal session
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
```

---

## API Endpoints

| Method | Endpoint                          | Description                                       |
|--------|-----------------------------------|---------------------------------------------------|
| `POST` | `/api/search/multi_search`        | Full text multi-search via Typesense             |
| `GET`  | `/api/products/{ean}/`            | Get product metadata and latest store prices     |
| `GET`  | `/api/products/{ean}/history`     | Get grouped historical price data (by store)     |
| `GET`  | `/api/carts/me`                    | Fetch the authenticated user's cart (JWT required) |
| `POST` | `/api/carts/me`                    | Upsert the authenticated user's cart (JWT required) |

---

## Notes

- **Product Data Table** (`unimart-products`):
    - Partition key: `ean`
    - Sort keys:
        - `meta` — product metadata
        - `last#{store}` — latest price by store
        - `price#{store}#{date}` — historical price entries per store/date

- **Cart Data Table** (`unimart-carts`):
    - Partition key: `user_id`
    - Sort key: `cart`
    - Example item:
      ```json
      {
        "user_id": "user-123",
        "SK": "cart",
        "items": [
          { "ean": "1234567890123", "count": 2 },
          { "ean": "9876543210987", "count": 1 }
        ]
      }
      ```

- **Local testing** is supported with **LocalStack**:
    - `DYNAMODB_ENDPOINT` enables local DynamoDB usage.
    - When `DYNAMODB_ENDPOINT` is set:
        - AWS credentials are ignored (LocalStack uses dummy values).
        - Cognito JWT verification is **bypassed**.
        - A **mock user** is injected with:
          ```json
          {
            "sub": "dev-user-123",
            "email": "dev@example.com",
            "username": "dev-user"
          }
          ```
