
variable "store" {
  description = "Store to scrape. Must be one of: dia, disco, jumbo, carrefour"
  type        = string
  validation {
    condition     = contains(["dia", "disco", "jumbo", "carrefour"], var.store)
    error_message = "Store must be one of: dia, disco, jumbo, carrefour"
  }
}

variable "eventbridge_role_arn" {
  description = "IAM role ARN EventBridge uses to run ECS tasks"
  type        = string
}

variable "image_url" {
  description = "Docker image to run for scraper"
  type        = string
}

variable "schedule_expression" {
  description = "CloudWatch schedule expression (e.g. rate(7 days))"
  type        = string
  default     = "rate(7 days)"
}

variable "sqs_queue_url" {
  description = "URL of the SQS queue"
  type        = string
}

variable "region" {
  type        = string
  default     = "us-east-1"
}

variable "subnet_ids" {
  type        = list(string)
}

variable "security_group_id" {
  type        = string
}

variable "execution_role_arn" {
  type        = string
}

variable "cluster_arn" {
  type        = string
}
