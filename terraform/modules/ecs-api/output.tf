output "ecs_service_name" {
  description = "ECS Service name"
  value       = aws_ecs_service.fastapi.name
}

output "task_definition_arn" {
  description = "ECS Task Definition ARN"
  value       = aws_ecs_task_definition.fastapi.arn
}
