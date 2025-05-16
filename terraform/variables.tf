variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

# New variables for secrets management
variable "github_repository" {
  description = "GitHub repository name (format: owner/repo)"
  type        = string
  default     = "twlabs/AIFSD-Thoughtworks-ResumeBuilder"
}

variable "secret_retention_days" {
  description = "Number of days to retain secrets after deletion"
  type        = number
  default     = 7
}

variable "enable_secret_rotation" {
  description = "Enable automatic secret rotation"
  type        = bool
  default     = false
}

variable "aws_account_id" {
  description = "AWS Account ID for resource creation - must be provided via environment variable TF_VAR_aws_account_id"
  type        = string
  sensitive   = true # Marks this variable as sensitive in logs and outputs
}

variable "tf_state_bucket" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "resume-builder-tf-state-new"
}

variable "app_name" {
  description = "Name of the application, used in resource naming"
  type        = string
  default     = "resume-builder"
}

variable "ecr_repositories" {
  description = "Names of ECR repositories to be created"
  type        = list(string)
  default     = ["resume-backend", "resume-frontend"]
}

variable "oidc_provider_url" {
  description = "GitHub OIDC provider URL"
  type        = string
  default     = "token.actions.githubusercontent.com"
}

variable "iam_role_prefix" {
  description = "Prefix for IAM roles"
  type        = string
  default     = "github-actions-oidc-role"
}

variable "create_new_secret" {
  description = "Whether to create a new secret or use existing one"
  type        = bool
  default     = false
}
