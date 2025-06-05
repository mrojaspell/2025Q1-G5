resource "aws_ecs_task_definition" "fastapi" {
  family                   = "api-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.execution_role_arn

  container_definitions = jsonencode([
    {
      name  = "fastapi"
      image = var.image_url
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/unimart-api"
          awslogs-region        = var.region
          awslogs-stream-prefix = "fastapi"
        }
      }
      portMappings = [{
        containerPort = 8000
        protocol      = "tcp"
      }]
      environment = [
        { name = "AWS_REGION", value = "us-east-1" },
        { name = "PRODUCTS_TABLE_NAME", value = var.products_table_name },
        { name = "CARTS_TABLE_NAME", value = var.carts_table_name },
        { name = "COGNITO_USERPOOL_ID", value = var.cognito_user_pool_id },
        { name = "COGNITO_APP_CLIENT_ID", value = var.cognito_user_pool_client_id },
        { name = "JWKS_BUCKET", value = var.jwks_bucket_name },
        { name = "JWKS_OBJECT_KEY", value = var.jwks_object_key },
        { name = "TYPESENSE_HOST", value = var.typesense_host },
        { name = "TYPESENSE_PORT", value = var.typesense_port },
        { name = "TYPESENSE_API_KEY", value = var.typesense_api_key },
        { name = "COLLECTION_NAME", value = var.collection_name }
      ]
    }
  ])
}

resource "aws_ecs_service" "fastapi" {
  name            = "api-service"
  cluster         = var.cluster_arn
  task_definition = aws_ecs_task_definition.fastapi.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    assign_public_ip = false
    security_groups = [var.security_group_id]
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "fastapi"
    container_port   = 8000
  }
}
