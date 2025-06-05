
output "rule_name" {
  value = aws_cloudwatch_event_rule.scraper_schedule.name
}

output "scraper_task_family" {
  value = aws_ecs_task_definition.scraper.family
}
