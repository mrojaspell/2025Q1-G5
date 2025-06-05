
variable "name" {
  description = "Name for the ALB"
  type        = string
}

variable "prefix" {
  description = "Name for the Target group prefix"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for ALB and SG"
  type        = string
}

variable "subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "target_port" {
  description = "Port that the ECS service listens on"
  type        = number
}

variable "health_check_path" {
  description = "Path for the ALB health check"
  type        = string
}

variable "internal" {
  description = "Whether the ALB is internal or internet-facing"
  type        = bool
}
