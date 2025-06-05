output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.unimart_user_pool.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.unimart_user_pool_client.id
}

output "jwks_bucket_name" {
  value = aws_s3_bucket.jwks.bucket
}

output "jwks_lambda_arn" {
  description = "ARN of the JWKS refresher Lambda"
  value       = aws_lambda_function.jwks_refresher.arn
}

output "jwks_schedule_rule" {
  description = "Name of the EventBridge rule that triggers JWKS refresh"
  value       = aws_cloudwatch_event_rule.jwks_refresh.name
}