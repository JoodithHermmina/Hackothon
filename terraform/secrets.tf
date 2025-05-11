# AWS Secrets Manager configuration
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "resume-builder/${var.environment}/app-secrets"
  description = "Application secrets for Resume Builder"

  tags = {
    Environment = var.environment
    Application = "resume-builder"
    ManagedBy   = "terraform"
  }
  
  lifecycle {
    # This prevents failures when Terraform can't read the secret during initial creation
    create_before_destroy = true
  }
}

# Initial secret version with placeholder values
resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    AWS_ACCESS_KEY_ID     = "placeholder"
    AWS_SECRET_ACCESS_KEY = "placeholder"
    AWS_REGION            = var.aws_region
    APP_DOMAIN            = "placeholder"
    AWS_ACCOUNT_ID        = var.aws_account_id
  })
}

# Output the secret ARN for reference
output "secrets_manager_arn" {
  value       = aws_secretsmanager_secret.app_secrets.arn
  description = "ARN of the Secrets Manager secret"
} 