#!/bin/bash
# Script to untaint resources that are marked as tainted in Terraform state

set -e

# Display help message
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
  echo "Usage: $0 [resource_name]"
  echo "Untaints Terraform resources that are causing deployment issues."
  echo ""
  echo "If no resource name is specified, all commonly tainted resources will be untainted."
  echo ""
  echo "Examples:"
  echo "  $0                                # Untaint all common resources"
  echo "  $0 aws_ecs_task_definition.backend  # Untaint only the backend task definition"
  exit 0
fi

# Define directory where Terraform configuration is located
TERRAFORM_DIR="../terraform"

# Change to the Terraform directory
cd "$(dirname "$0")"
cd $TERRAFORM_DIR

echo "=== Starting resource untainting process ==="

# If a specific resource is provided, untaint only that resource
if [ ! -z "$1" ]; then
  echo "Untainting specific resource: $1"
  terraform untaint "$1"
  exit $?
fi

# List of resources that commonly get tainted during deployments
RESOURCES=(
  "aws_ecs_task_definition.backend"
  "aws_ecs_task_definition.frontend"
  "aws_ecs_service.backend"
  "aws_ecs_service.frontend"
  "aws_secretsmanager_secret.app_secrets"
  "aws_secretsmanager_secret_version.app_secrets_version"
)

# Untaint each resource, continuing even if some fail
for resource in "${RESOURCES[@]}"; do
  echo "Untainting $resource..."
  terraform untaint "$resource" || echo "Warning: Could not untaint $resource (it may not be tainted, or may not exist)"
done

echo "=== Resource untainting process completed ==="
echo "NOTE: If resources are still marked as tainted, you may need to run 'terraform refresh'"
echo "      or perform a manual state management using 'terraform state' commands." 