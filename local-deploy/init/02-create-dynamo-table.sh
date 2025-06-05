#!/bin/bash

awslocal dynamodb create-table \
  --table-name unimart-products \
  --attribute-definitions \
    AttributeName=ean,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=ean,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Para streams asi dynamo triggerea la lambda
# Que carga a typesense
awslocal dynamodb update-table \
  --table-name unimart-products \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE

echo "Created DynamoDB table: unimart-products"

# Create carts table
awslocal dynamodb create-table \
  --table-name unimart-carts \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

echo "Created DynamoDB table: unimart-carts"
