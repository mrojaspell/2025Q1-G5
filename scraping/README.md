# 🛒 Unimart Scrapers

This module runs supermarket scrapers and publishes individual items to an SQS queue for asynchronous processing.

---

## ✅ Setup

From the `./scraping` directory:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🚀 Run Scraper (SQS mode)

This version of the script launches a single scraper and sends each scraped item to an AWS SQS queue using a pipeline.

```bash
SCRAPER_STORE=dia python main.py
```

- Valid values for `SCRAPER_STORE`: `dia`, `disco`, `jumbo`, `carrefour`
- Items will be pushed to the queue defined in your `.env` config via the `SQSPipeline`

---

## ⚙️ Environment Variables

Define the following in a `.env` file:

```dotenv
SCRAPER_STORE=dia
AWS_REGION=us-east-1
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/unimart-queue
LIMIT=100
```

---

## 🛒 Supported Stores

| Store     | Status   |
|-----------|----------|
| Disco     | ✅        |
| DIA       | ✅        |
| Jumbo     | ✅        |
| Carrefour | ✅        |
| Coto      | 🚧 WIP    |

---

## 📦 Legacy Script (JSON Merge + Upload)

For the original behavior of scraping all stores, saving local JSONs, merging, and uploading to DynamoDB or S3:

```bash
python scraping_script.py --parallel --dynamo
```

### CLI Options

| Flag                      | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| `--limit <int>`           | Limit number of pages per scraper (for testing)                             |
| `--scrapers <store> ...`  | Run only selected scrapers. Options: `dia`, `disco`, `jumbo`, `carrefour`   |
| `--concurrency <int>`     | Set number of concurrent requests per scraper (default: `2`)                |
| `--no-scrape`             | Skip scraping step (just process and/or upload)                             |
| `--dynamo`                | Upload to `dynamoDB` (table: `unimart-products`)                             |
| `--s3-bucket <name>`      | Upload to `S3` (key is always `products.json`)                               |
| `--parallel`              | Run scrapers in parallel (default is sequential)                            |
