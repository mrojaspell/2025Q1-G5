
provider "aws" {
  profile = var.profile
}

resource "aws_ecr_repository" "api" {
  name = "unimart-api"
  force_delete = true
}

resource "aws_ecr_repository" "scraper" {
  name = "unimart-scraper"
  force_delete = true
}

resource "aws_ecr_repository" "typesense" {
  name = "unimart-typesense"
  force_delete = true
}

resource "aws_ecr_repository" "typesense_sidecar" {
  name = "unimart-typesense-sidecar"
  force_delete = true
}
