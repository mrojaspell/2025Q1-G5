
variable "region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "desired_count" {
  description = "Number of desired instances for the ECS service"
  type        = number
}

variable "cluster_arn" {
  description = "ECS cluster ARN to attach the service to"
  type        = string
}

variable "image_url" {
  description = "Docker image URI for FastAPI"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS service"
  type        = string
}

variable "target_group_arn" {
  description = "Target group ARN for ALB"
  type        = string
}

variable "execution_role_arn" {
  description = "IAM role ARN for ECS task execution (e.g. LabRole)"
  type        = string
}

variable "products_table_name" {
  type    = string
}

variable "carts_table_name" {
  type    = string
}

variable "cognito_user_pool_id" {
  type    = string
}

variable "cognito_user_pool_client_id" {
  type    = string
}

variable "jwks_bucket_name" {
  type    = string
}

variable "jwks_object_key" {
  type    = string
}

variable "typesense_host" {
  type    = string
}

variable "typesense_port" {
  type    = string
}

variable "typesense_api_key" {
  type    = string
}

variable "collection_name" {
  type    = string
}
