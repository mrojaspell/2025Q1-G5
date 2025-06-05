resource "aws_dynamodb_table" "typesense_peers" {
  name         = "typesense-peers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "cluster_name"
  range_key    = "instance_id"

  attribute {
    name = "cluster_name"
    type = "S"
  }

  attribute {
    name = "instance_id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

resource "aws_ecs_task_definition" "typesense" {
  family                   = "typesense-node"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "typesense"
      image     = var.typesense_image_url
      essential = true
      portMappings = [
        { containerPort = 8108, protocol = "tcp" },
        { containerPort = 8107, protocol = "tcp" }
      ]
      environment = [
        { name = "TYPESENSE_API_KEY", value = var.typesense_api_key }
      ]
      mountPoints = [
        {
          sourceVolume  = "shared-config",
          containerPath = "/config"
        },
        {
          sourceVolume  = "data-dir",
          containerPath = "/data"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/unimart-typesense",
          awslogs-region        = var.region,
          awslogs-stream-prefix = "typesense"
        }
      }
    },
    {
      name      = "sidecar"
      image     = var.sidecar_image_url
      essential = false
      mountPoints = [
        {
          sourceVolume  = "shared-config",
          containerPath = "/config"
        }
      ]
      environment = [
        { name = "CLUSTER_NAME", value = "typesense" },
        { name = "AWS_REGION", value = var.region }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/unimart-typesense",
          awslogs-region        = var.region,
          awslogs-stream-prefix = "sidecar"
        }
      }
    }
  ])

  volume {
    name = "shared-config"
  }

  volume {
    name = "data-dir"
  }
}

resource "aws_ecs_service" "typesense" {
  name            = "typesense-service"
  cluster         = var.cluster_arn
  task_definition = aws_ecs_task_definition.typesense.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "typesense"
    container_port   = 8108
  }

  depends_on = [
    aws_dynamodb_table.typesense_peers
  ]
}
