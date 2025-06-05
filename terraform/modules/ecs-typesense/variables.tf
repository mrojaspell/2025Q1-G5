
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

variable "subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group for the service"
  type        = string
}

variable "execution_role_arn" {
  description = "IAM role for ECS tasks"
  type        = string
}

variable "target_group_arn" {
  description = "Target group ARN for the ALB"
  type        = string
}

variable "typesense_image_url" {
  description = "ECR image URL for custom Typesense with entrypoint"
  type        = string
}

variable "sidecar_image_url" {
  description = "ECR image URL for sidecar that writes nodes.txt"
  type        = string
}

variable "typesense_api_key" {
  description = "API key to secure Typesense access"
  type        = string
}
