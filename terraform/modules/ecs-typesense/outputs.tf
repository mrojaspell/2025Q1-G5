
output "service_name" {
  value = aws_ecs_service.typesense.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.typesense.arn
}
