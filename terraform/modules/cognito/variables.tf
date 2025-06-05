variable "user_pool_name" {
  type    = string
}

variable "user_pool_client_name" {
  type    = string
}

variable "lab_role_arn" {
  description = "ARN of the existing IAM role (LabRole) to run the JWKS refresher Lambda"
  type        = string
}

variable "jwks_bucket_name" {
  description = "S3 bucket name where JWKS will be saved"
  type        = string
}

variable "jwks_key" {
  description = "S3 object key under which to store the JWKS"
  type        = string
  default     = "jwks.json"
}

variable "refresher_lambda_zip_path" {
  description = "Path to the JWKS refresher Lambda zip file"
  type        = string
}
