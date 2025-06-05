#!/bin/bash

set -e

BUCKET="unimart-web"
SITE_DIR="/host/web-client/out"

# Create bucket
awslocal s3 mb s3://$BUCKET

# Enable static site hosting
awslocal s3 website s3://$BUCKET/ \
  --index-document index.html \
  --error-document index.html

# Sync site
awslocal s3 sync $SITE_DIR s3://$BUCKET

echo "Synced static site to S3 bucket: $BUCKET"
