locals {
  public_subnets  = concat(var.ext_alb_subnets, var.scraper_subnets)
  private_subnets = concat(var.int_alb_subnets, var.api_subnets, var.typesense_subnets, var.lambda_subnets, var.interface_ep_subnets)
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = var.name
  cidr = var.cidr_block

  azs             = var.azs
  public_subnets  = local.public_subnets
  private_subnets = local.private_subnets

  enable_dns_support     = true
  enable_dns_hostnames   = true

  public_subnet_tags = {
    Role = "public"
  }

  private_subnet_tags = {
    Role = "private"
  }

  tags = {
    Project = var.name
  }
}


resource "aws_security_group" "typesense_alb_sg" {
  name        = "${var.name}-typesense-alb-sg"
  description = "Allow API and Lambda to reach Typesense via ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.api_sg.id, aws_security_group.lambda_typesense_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api_alb_sg" {
  name        = "${var.name}-api-alb-sg"
  description = "Allow HTTP/HTTPS from the internet"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api_sg" {
  name        = "${var.name}-api-sg"
  description = "Allow ALB ingress and Typesense egress"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.api_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "typesense_sg" {
  name        = "${var.name}-typesense-sg"
  description = "Allow Typesense to receive connections from Load Balancer and between nodes"
  vpc_id      = module.vpc.vpc_id

  # Allow traffic from the ALB to port 8108 (API)
  ingress {
    from_port       = 8108
    to_port         = 8108
    protocol        = "tcp"
    security_groups = [aws_security_group.typesense_alb_sg.id]
    description     = "Allow ALB access to Typesense API"
  }

  # Allow internal clustering traffic on port 8107
  ingress {
    from_port   = 8107
    to_port     = 8107
    protocol    = "tcp"
    self        = true
    description = "Allow clustering between Typesense nodes"
  }

  # Allow internal traffic on port 8108 (Typesense API)
  ingress {
    from_port   = 8108
    to_port     = 8108
    protocol    = "tcp"
    self        = true
    description = "Allow internal Typesense API access"
  }

  # Outbound: allow all (typical for ECS Fargate tasks)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name}-typesense-sg"
  }
}

resource "aws_security_group" "scraper_sg" {
  name        = "${var.name}-scraper-sg"
  description = "Allow scrapers to reach SQS and internet"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "lambda_typesense_sg" {
  name        = "${var.name}-lambda-typesense-sg"
  description = "Allow Lambda to reach Typesense and DynamoDB"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // No ingress (Lambda doesn’t receive connections)
}


resource "aws_security_group" "endpoint_sg" {
  name        = "${var.name}-vpc-endpoint-sg"
  description = "Allow ECS services to access VPC interface endpoints"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Allow HTTPS from ECS API and scraper tasks"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [
      aws_security_group.api_sg.id,
      aws_security_group.scraper_sg.id,
      aws_security_group.typesense_sg.id,
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
  tags              = { Name = "dynamodb-endpoint" }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
  tags              = { Name = "s3-gateway-endpoint" }
}
