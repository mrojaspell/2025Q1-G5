
output "sqs_lambda_arn" {
  value = aws_lambda_function.sqs_to_dynamo.arn
}

output "typesense_lambda_arn" {
  value = aws_lambda_function.dynamo_to_typesense.arn
}
