resource "aws_cloudwatch_event_rule" "scraper_schedule" {
  name                = "scraper-${var.store}-schedule"
  schedule_expression = var.schedule_expression
}

resource "aws_cloudwatch_event_target" "scraper_target" {
  rule      = aws_cloudwatch_event_rule.scraper_schedule.name
  target_id = "ecs-scraper-${var.store}"
  arn       = var.cluster_arn

  role_arn = var.eventbridge_role_arn

  ecs_target {
    launch_type         = "FARGATE"
    task_definition_arn = aws_ecs_task_definition.scraper.arn

    network_configuration {
      subnets          = var.subnet_ids
      security_groups  = [var.security_group_id]
      assign_public_ip = true
    }
  }
}

resource "aws_ecs_task_definition" "scraper" {
  family                   = "scraper-${var.store}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.execution_role_arn

  container_definitions = jsonencode([
    {
      name  = "scraper-${var.store}"
      image = var.image_url
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/unimart-scraper"
          awslogs-region        = var.region
          awslogs-stream-prefix = "${var.store}"
        }
      }
      environment = [
        { name = "SCRAPER_STORE", value = var.store },
        { name = "SQS_QUEUE_URL", value = var.sqs_queue_url },
        { name = "LIMIT", value = "1" },
        { name = "AWS_REGION", value = var.region }
      ]
    }
  ])
}
