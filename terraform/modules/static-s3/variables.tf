
variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "index_document" {
  description = "Main index document"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Error fallback document"
  type        = string
  default     = "index.html"
}
