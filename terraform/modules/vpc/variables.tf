variable "region" {
  description = "AWS region"
  type        = string
}

variable "name" {
  description = "Name of the VPC"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
}

variable "ext_alb_subnets" {
  description = "Public subnets for external ALB (1 per AZ)"
  type        = list(string)
}

variable "int_alb_subnets" {
  description = "Private subnets for internal ALB (1 per AZ)"
  type        = list(string)
}

variable "interface_ep_subnets" {
  description = "Subnets for interface VPC endpoints (1 per AZ)"
  type        = list(string)
}

variable "scraper_subnets" {
  description = "Public subnets for scrapers"
  type        = list(string)
}

variable "api_subnets" {
  description = "Private subnets for API"
  type        = list(string)
}

variable "typesense_subnets" {
  description = "Private subnets for Typesense"
  type        = list(string)
}


variable "lambda_subnets" {
  description = "Private subnets for Lambda"
  type        = list(string)
}
