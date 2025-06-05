
resource "aws_lambda_function" "sqs_to_dynamo" {
  function_name = "sqs-to-dynamo"
  filename      = var.sqs_zip_path
  source_code_hash = filebase64sha256(var.sqs_zip_path)
  handler       = "sqs_to_dynamo.lambda_handler"
  runtime       = "python3.11"
  role          = var.execution_role_arn
  timeout       = 60

  environment {
    variables = {
      DYNAMO_TABLE      = var.dynamo_table
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn  = var.sqs_queue_arn
  function_name     = aws_lambda_function.sqs_to_dynamo.arn
  batch_size        = 250
  maximum_batching_window_in_seconds = 60
}

resource "aws_lambda_function" "dynamo_to_typesense" {
  function_name = "dynamo-to-typesense"
  filename      = var.typesense_zip_path
  source_code_hash = filebase64sha256(var.typesense_zip_path)
  handler       = "dynamo_to_typesense.lambda_handler"
  runtime       = "python3.11"
  role          = var.execution_role_arn
  timeout       = 120

  environment {
    variables = {
      DYNAMO_TABLE       = var.dynamo_table
      TYPESENSE_HOST     = var.typesense_host
      TYPESENSE_PORT     = var.typesense_port
      TYPESENSE_API_KEY  = var.typesense_api_key
      COLLECTION_NAME    = var.collection_name
    }
  }

  vpc_config {
    subnet_ids         = var.lambda_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }
}

resource "aws_lambda_event_source_mapping" "dynamo_stream_trigger" {
  event_source_arn  = var.dynamo_stream_arn
  function_name     = aws_lambda_function.dynamo_to_typesense.arn
  starting_position = "TRIM_HORIZON"
  batch_size        = 1000
  maximum_batching_window_in_seconds = 60
}
