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
  default     = "JoodithHermmina/Hackothon"
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
