#Cognito user pool
resource "aws_cognito_user_pool" "unimart_user_pool" {
  name = var.user_pool_name

  # Allow users to sign in with their email address
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = "Your verification code is {####}"
    email_subject        = "Verify your email for Unimart"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "unimart_user_pool_client" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.unimart_user_pool.id
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"
}

# Jwks bucket
resource "aws_s3_bucket" "jwks" {
  bucket        = var.jwks_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "jwks" {
  bucket                  = aws_s3_bucket.jwks.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_lambda_function" "jwks_refresher" {
  function_name = "jwks_refresher"
  handler       = "lambda_function.handler"
  runtime       = "python3.11"
  role          = var.lab_role_arn

  filename      = var.refresher_lambda_zip_path
  source_code_hash = filebase64sha256(var.refresher_lambda_zip_path)

  environment {
    variables = {
      USER_POOL_ID = aws_cognito_user_pool.unimart_user_pool.id
      JWKS_BUCKET  = var.jwks_bucket_name
      JWKS_KEY     = var.jwks_key
    }
  }

  timeout = 30
}

resource "aws_cloudwatch_event_rule" "jwks_refresh" {
  name                = "refresh-cognito-jwks"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "jwks_lambda_target" {
  rule      = aws_cloudwatch_event_rule.jwks_refresh.name
  target_id = "jwksRefresher"

  arn       = aws_lambda_function.jwks_refresher.arn
  role_arn  = var.lab_role_arn
}
