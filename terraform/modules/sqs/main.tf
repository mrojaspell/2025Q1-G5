
resource "aws_sqs_queue" "this" {
  name = var.name
  visibility_timeout_seconds = 70
}
