output "vpc_id" {
  value = module.vpc.vpc_id
}

# Public subnet slices
output "ext_alb_subnet_ids" {
  value = slice(module.vpc.public_subnets, 0, length(var.ext_alb_subnets))
}

output "scraper_subnet_ids" {
  value = slice(module.vpc.public_subnets, length(var.ext_alb_subnets), length(var.ext_alb_subnets) + length(var.scraper_subnets))
}

# Private subnet slices
output "int_alb_subnet_ids" {
  value = slice(module.vpc.private_subnets, 0, length(var.int_alb_subnets))
}

output "api_subnet_ids" {
  value = slice(module.vpc.private_subnets,
    length(var.int_alb_subnets),
    length(var.int_alb_subnets) + length(var.api_subnets)
  )
}

output "typesense_subnet_ids" {
  value = slice(module.vpc.private_subnets,
    length(var.int_alb_subnets) + length(var.api_subnets),
    length(var.int_alb_subnets) + length(var.api_subnets) + length(var.typesense_subnets)
  )
}

output "lambda_subnet_ids" {
  value = slice(module.vpc.private_subnets,
    length(var.int_alb_subnets) + length(var.api_subnets) + length(var.typesense_subnets),
    length(var.int_alb_subnets) + length(var.api_subnets) + length(var.typesense_subnets) + length(var.lambda_subnets)
  )
}

output "interface_ep_subnet_ids" {
  value = slice(module.vpc.private_subnets,
    length(var.int_alb_subnets) + length(var.api_subnets) + length(var.typesense_subnets) + length(var.lambda_subnets),
    length(var.int_alb_subnets) + length(var.api_subnets) + length(var.typesense_subnets) + length(var.lambda_subnets) + length(var.interface_ep_subnets)
  )
}

# Security Groups
output "api_alb_sg_id" {
  value = aws_security_group.api_alb_sg.id
}

output "typesense_alb_sg_id" {
  value = aws_security_group.typesense_alb_sg.id
}

output "api_sg_id" {
  value = aws_security_group.api_sg.id
}

output "typesense_sg_id" {
  value = aws_security_group.typesense_sg.id
}

output "scraper_sg_id" {
  value = aws_security_group.scraper_sg.id
}

output "lambda_typesense_sg_id" {
  value = aws_security_group.lambda_typesense_sg.id
}

output "endpoint_sg_id" {
  value = aws_security_group.endpoint_sg.id
}
