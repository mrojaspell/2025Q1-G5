# ---------------------------------------
# Networking Outputs
# ---------------------------------------

output "vpc_id" {
  description = "VPC ID used across all modules"
  value       = module.vpc.vpc_id
}


# ---------------------------------------
# Load Balancer & DNS Outputs
# ---------------------------------------

output "api_dns_name" {
  description = "Public DNS name of the API ALB"
  value       = module.api_alb.alb_dns_name
}


# ---------------------------------------
# Static Site Outputs
# ---------------------------------------

output "static_site_url" {
  description = "Website endpoint for the static S3 site"
  value       = module.s3_static_site.website_endpoint
}

output "static_site_bucket" {
  description = "S3 bucket name for the static site"
  value = module.s3_static_site.bucket_name
}


# ---------------------------------------
# ECS Service Outputs
# ---------------------------------------

output "scraper_service_names" {
  description = "List of ECS service names for deployed scrapers"
  value       = [for store, mod in module.ecs_scraper : mod.scraper_task_family]
}

# ---------------------------------------
# Cognito Outputs
# ---------------------------------------

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.cognito_user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.cognito_user_pool_client_id
}

output "jwks_bucket" {
  description = "S3 bucket for JWKS keys"
  value       = module.cognito.jwks_bucket_name
}

