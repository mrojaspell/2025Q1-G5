# ---------------------------------------
# Provider and IAM Setup
# ---------------------------------------
provider "aws" {
  profile = var.profile
}

data "aws_iam_role" "labrole" {
  name = "LabRole"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

# ---------------------------------------
# Infrastructure Modules
# ---------------------------------------

module "vpc" {
  source     = "../modules/vpc"
  name       = "unimart"
  region     = data.aws_region.current.name
  cidr_block = local.vpc_cidr_block
  azs        = var.azs

  ext_alb_subnets       = local.ext_alb_subnets
  int_alb_subnets       = local.int_alb_subnets
  scraper_subnets       = local.scraper_subnets
  api_subnets           = local.api_subnets
  typesense_subnets     = local.typesense_subnets
  lambda_subnets        = local.lambda_subnets
  interface_ep_subnets  = local.interface_ep_subnets
}

module "cognito" {
  source = "../modules/cognito"
  user_pool_name = "unimart_user_pool"
  user_pool_client_name = "unimart_user_pool_client"
  jwks_bucket_name = "${var.jwks_bucket}-${data.aws_caller_identity.current.account_id}"
  lab_role_arn           = data.aws_iam_role.labrole.arn
  refresher_lambda_zip_path = var.cognito_keys_to_s3_zip_path
}

module "s3_static_site" {
  source      = "../modules/static-s3"
  bucket_name = "${var.static_site_bucket}-${data.aws_caller_identity.current.account_id}"
}

# ---------------------------------------
# Data bases - Dynamo
# ---------------------------------------

resource "aws_dynamodb_table" "unimart_products" {
  name         = var.products_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ean"
  range_key    = "SK"

  attribute {
    name = "ean"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"
}

resource "aws_dynamodb_table" "unimart_carts" {
  name         = var.carts_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "SK"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  stream_enabled   = false
}

# ---------------------------------------
# Load Balancers
# ---------------------------------------

module "api_alb" {
  source            = "../modules/load-balancer"
  name              = "unimart-api"
  prefix            = "api"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.ext_alb_subnet_ids
  security_group_id = module.vpc.api_alb_sg_id
  internal          = false
  target_port       = 8000
  health_check_path = "/health"
}

module "typesense_alb" {
  source            = "../modules/load-balancer"
  name              = "unimart-typesense"
  prefix            = "tsns"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.int_alb_subnet_ids
  security_group_id = module.vpc.typesense_alb_sg_id
  internal          = true
  target_port       = 8108
  health_check_path = "/health"
}

# ---------------------------------------
# ECS Services
# ---------------------------------------

resource "aws_ecs_cluster" "main" {
  name = "unimart-cluster"
}

module "ecs_typesense" {
  source              = "../modules/ecs-typesense"
  region              = data.aws_region.current.name
  typesense_image_url = var.typesense_image
  sidecar_image_url   = var.typesense_sidecar_image
  cluster_arn         = aws_ecs_cluster.main.arn
  desired_count       = length(var.azs)
  subnet_ids          = module.vpc.typesense_subnet_ids
  security_group_id   = module.vpc.typesense_sg_id
  target_group_arn    = module.typesense_alb.target_group_arn
  execution_role_arn  = data.aws_iam_role.labrole.arn
  typesense_api_key   = var.typesense_api_key
  depends_on          = [module.typesense_alb, module.vpc]
}

module "ecs_api" {
  source              = "../modules/ecs-api"
  region              = data.aws_region.current.name
  desired_count       = length(var.azs)
  cluster_arn         = aws_ecs_cluster.main.arn
  image_url           = var.api_image
  subnet_ids          = module.vpc.api_subnet_ids
  security_group_id   = module.vpc.api_sg_id
  target_group_arn    = module.api_alb.target_group_arn
  execution_role_arn  = data.aws_iam_role.labrole.arn

  products_table_name   = aws_dynamodb_table.unimart_products.name
  carts_table_name      = aws_dynamodb_table.unimart_carts.name

  cognito_user_pool_id  = module.cognito.cognito_user_pool_id
  cognito_user_pool_client_id = module.cognito.cognito_user_pool_client_id
  jwks_bucket_name      = module.cognito.jwks_bucket_name
  jwks_object_key       = "jwks.json"

  typesense_api_key   = var.typesense_api_key
  typesense_host      = module.typesense_alb.alb_dns_name
  typesense_port      = 80
  collection_name     = var.collection_name

  depends_on = [
    module.api_alb,
    module.vpc,
    aws_dynamodb_table.unimart_products,
    aws_dynamodb_table.unimart_carts,
    module.ecs_typesense,
    module.typesense_alb
  ]
}

module "ecs_scraper" {
  source              = "../modules/ecs-scraper"
  for_each            = toset(var.stores)

  eventbridge_role_arn = data.aws_iam_role.labrole.arn
  store               = each.key
  image_url           = var.scraper_image
  cluster_arn         = aws_ecs_cluster.main.arn
  subnet_ids          = module.vpc.scraper_subnet_ids
  security_group_id   = module.vpc.scraper_sg_id
  execution_role_arn  = data.aws_iam_role.labrole.arn
  schedule_expression = "rate(7 days)"
  sqs_queue_url       = module.sqs.queue_url
  region              = data.aws_region.current.name
  depends_on          = [module.vpc, module.sqs]
}

# ---------------------------------------
# Interface Endpoints for AWS Services
# ---------------------------------------

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.interface_ep_subnet_ids
  private_dns_enabled = true
  security_group_ids  = [module.vpc.endpoint_sg_id]
  tags                = { Name = "ecr-api-endpoint" }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.interface_ep_subnet_ids
  private_dns_enabled = true
  security_group_ids  = [module.vpc.endpoint_sg_id]
  tags                = { Name = "ecr-dkr-endpoint" }
}

resource "aws_vpc_endpoint" "cloudwatch_logs" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type = "Interface"
  subnet_ids         = module.vpc.interface_ep_subnet_ids
  private_dns_enabled = true
  security_group_ids = [module.vpc.endpoint_sg_id]
  tags = { Name = "vpce-cloudwatch-logs" }
}

# ---------------------------------------
# SQS and Lambda
# ---------------------------------------

module "sqs" {
  source = "../modules/sqs"
  name   = "unimart-products-queue"
}

module "lambda_pipeline" {
  source                    = "../modules/lambda-pipeline"
  sqs_zip_path              = var.sqs_zip_path
  typesense_zip_path        = var.typesense_zip_path
  execution_role_arn        = data.aws_iam_role.labrole.arn
  sqs_queue_arn             = module.sqs.queue_arn

  dynamo_stream_arn         = aws_dynamodb_table.unimart_products.stream_arn
  dynamo_table              = aws_dynamodb_table.unimart_products.name

  typesense_api_key         = var.typesense_api_key
  typesense_host            = module.typesense_alb.alb_dns_name
  typesense_port            = 80
  collection_name           = var.collection_name

  lambda_security_group_id  = module.vpc.lambda_typesense_sg_id
  lambda_subnet_ids         = module.vpc.lambda_subnet_ids

  depends_on                = [
    module.ecs_typesense,
    aws_dynamodb_table.unimart_products,
    module.sqs
  ]
}

# ---------------------------------------
# CloudWatch Log Group for ECS
# ---------------------------------------


resource "aws_cloudwatch_log_group" "unimart_api" {
  name              = "/ecs/unimart-api"
  retention_in_days = 1
  tags = {
    Service = "api"
    Project = "unimart"
  }
}

resource "aws_cloudwatch_log_group" "unimart_scraper" {
  name              = "/ecs/unimart-scraper"
  retention_in_days = 1
  tags = {
    Service = "scraper"
    Project = "unimart"
  }
}

resource "aws_cloudwatch_log_group" "unimart_typesense" {
  name              = "/ecs/unimart-typesense"
  retention_in_days = 1
  tags = {
    Service = "typesense"
    Project = "unimart"
  }
}
