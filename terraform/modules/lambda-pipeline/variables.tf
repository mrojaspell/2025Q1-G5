
variable "sqs_zip_path" {
  type        = string
  description = "Path to the SQS-to-Dynamo Lambda ZIP file"
}

variable "typesense_zip_path" {
  type        = string
  description = "Path to the Dynamo-to-Typesense Lambda ZIP file"
}

variable "execution_role_arn" {
  type        = string
  description = "ARN of LabRole IAM role"
}

variable "dynamo_table" {
  type    = string
}

variable "sqs_queue_arn" {
  type        = string
  description = "ARN of the SQS queue"
}

variable "dynamo_stream_arn" {
  type        = string
  description = "ARN of the DynamoDB stream"
}

variable "typesense_host" {
  type    = string
  default = "typesense"
}

variable "typesense_port" {
  type    = number
}

variable "typesense_api_key" {
  type    = string
}

variable "collection_name" {
  type    = string
}

variable "lambda_subnet_ids" {
  type        = list(string)
}

variable "lambda_security_group_id" {
  type        = string
}
