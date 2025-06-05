#!/bin/bash

set -e

echo "Creating SQS queue: unimart-products-queue"

awslocal sqs create-queue --queue-name unimart-products-queue

echo "SQS queue ready"
