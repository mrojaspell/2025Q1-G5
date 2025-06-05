# ---------------------------------------
# Profile & AZs
# ---------------------------------------

variable "profile" {
  description = "AWS profile to use"
  type        = string
  default     = "default"
}

variable "azs" {
  description = "List of availability zones to use"
  type        = list(string)
}


# ---------------------------------------
# Docker Images (ECR)
# ---------------------------------------

variable "api_image" {
  description = "Docker image for the API in ECR"
  type        = string
}

variable "scraper_image" {
  description = "Docker image for the scraper in ECR"
  type        = string
}

variable "typesense_image" {
  description = "Docker image for the Typesense node in ECR"
  type        = string
}

variable "typesense_sidecar_image" {
  description = "Docker image for the Typesense sidecar in ECR"
  type        = string
}


# ---------------------------------------
# Lambda Artifacts
# ---------------------------------------

variable "sqs_zip_path" {
  description = "Path to the SQS Lambda function zip file"
  type        = string
}

variable "typesense_zip_path" {
  description = "Path to the Typesense Lambda function zip file"
  type        = string
}

variable "cognito_keys_to_s3_zip_path" {
  description = "Path to the Cognito keys to S3 Lambda function zip file"
  type        = string
}

# ---------------------------------------
# S3 / Static Site
# ---------------------------------------

variable "static_site_bucket" {
  description = "S3 bucket name for the static site"
  type        = string
}

variable "jwks_bucket" {
  description = "S3 bucket name for JWKS"
  type        = string
}

# ---------------------------------------
# Typesense Configuration
# ---------------------------------------

variable "typesense_api_key" {
  description = "API key for Typesense"
  type        = string
}

variable "collection_name" {
  description = "Typesense collection name"
  type        = string
  default     = "products"
}


# ---------------------------------------
# DynamoDB Configuration
# ---------------------------------------

variable "products_table_name" {
  description = "DynamoDB products table name"
  type        = string
  default     = "unimart-products"
}

variable "carts_table_name" {
  description = "DynamoDB table name for user carts"
  type        = string
  default     = "unimart-carts"
}


# ---------------------------------------
# Scraper Configuration
# ---------------------------------------

variable "stores" {
  description = "List of store names to deploy scrapers for"
  type        = list(string)
  default     = ["carrefour", "jumbo", "dia", "disco"]
}
