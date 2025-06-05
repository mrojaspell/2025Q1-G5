#!/bin/bash
set -e

echo "Packaging Sqs to dynamo lambda..."
cd /lambda
zip -r /tmp/sqs_to_dynamo.zip sqs_to_dynamo.py >/dev/null

echo "Deploying sqs to dynamo lambda..."
awslocal lambda create-function \
  --function-name sqs-to-dynamo \
  --runtime python3.11 \
  --handler sqs_to_dynamo.lambda_handler \
  --role arn:aws:iam::000000000000:role/dummy \
  --zip-file fileb:///tmp/sqs_to_dynamo.zip \
  --environment "Variables={DYNAMO_TABLE=unimart-products,AWS_REGION=us-east-1,DYNAMODB_ENDPOINT=http://dynamodb.us-east-1.localhost.localstack.cloud:4566}" \
  --timeout 60

echo "Setting sqs to dynamo event..."

awslocal sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/unimart-products-queue \
  --attributes VisibilityTimeout=180

awslocal lambda create-event-source-mapping \
  --function-name sqs-to-dynamo \
  --event-source-arn arn:aws:sqs:us-east-1:000000000000:unimart-products-queue \
  --batch-size 250 \
  --maximum-batching-window-in-seconds 60

echo "Sqs to dynamo lambda setup complete."


echo "Packaging Dynamo to Typesense Lambda..."
cd /lambda

# Zip
zip -r /tmp/dynamo_to_typesense.zip dynamo_to_typesense.py >/dev/null

echo "Deploying Dynamo to Typesense Lambda..."
awslocal lambda create-function \
  --function-name dynamo-to-typesense \
  --runtime python3.11 \
  --handler dynamo_to_typesense.lambda_handler \
  --role arn:aws:iam::000000000000:role/dummy \
  --zip-file fileb:///tmp/dynamo_to_typesense.zip \
  --environment "Variables={DYNAMO_TABLE=unimart-products,AWS_REGION=us-east-1,DYNAMODB_ENDPOINT=http://dynamodb.us-east-1.localhost.localstack.cloud:4566,TYPESENSE_HOST=typesense, TYPESENSE_PORT=8108, TYPESENSE_API_KEY=xyz,COLLECTION_NAME=products}" \
  --timeout 120

STREAM_ARN=$(awslocal dynamodb describe-table --table-name unimart-products --query "Table.LatestStreamArn" --output text)

awslocal lambda create-event-source-mapping \
  --function-name dynamo-to-typesense \
  --event-source-arn $STREAM_ARN \
  --starting-position TRIM_HORIZON \
  --batch-size 1000 \
  --maximum-batching-window-in-seconds 60

echo "Dynamo to Typesense Lambda setup complete."
