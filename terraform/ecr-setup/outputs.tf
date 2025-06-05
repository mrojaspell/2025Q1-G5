
output "api_image_url" {
  value = aws_ecr_repository.api.repository_url
}

output "scraper_image_url" {
  value = aws_ecr_repository.scraper.repository_url
}

output "typesense_image_url" {
  value = aws_ecr_repository.typesense.repository_url
}

output "sidecar_image_url" {
  value = aws_ecr_repository.typesense_sidecar.repository_url
}
