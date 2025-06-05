import os
import json
import boto3
from datetime import datetime, timezone
from scrapy.exceptions import NotConfigured

class SQSPipeline:
    def __init__(self):
        self.queue_url = os.getenv("SQS_QUEUE_URL")
        if not self.queue_url:
            raise NotConfigured("SQS_QUEUE_URL is not set")

        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.endpoint_url = os.getenv("SQS_ENDPOINT_URL")  # Optional for LocalStack
        self.use_localstack = bool(self.endpoint_url)

        if self.use_localstack:
            # LocalStack: use dummy credentials
            self.client = boto3.client(
                "sqs",
                region_name=self.region,
                aws_access_key_id="test",
                aws_secret_access_key="test",
                endpoint_url=self.endpoint_url
            )
        else:
            # AWS: use IAM task role or default chain
            self.client = boto3.client(
                "sqs",
                region_name=self.region
            )

    def process_item(self, item, spider):
        try:
            if not item.get("ean") or not item["ean"].strip():
                raise ValueError("Missing or empty 'ean'")
            if not item.get("store") or not item["store"].strip():
                raise ValueError("Missing or empty 'store'")
            if "price" not in item or not isinstance(item["price"], (int, float)):
                raise ValueError("Missing or invalid 'price'")

            item["date"] = datetime.now(timezone.utc).date().isoformat()

            message_body = json.dumps(dict(item))
            self.client.send_message(
                QueueUrl=self.queue_url,
                MessageBody=message_body
            )
            spider.logger.debug(f"Sent item to SQS: {item['ean']} - {item['store']}")
        except Exception as e:
            spider.logger.error(f"Failed to send item to SQS: {e}")
        return item
