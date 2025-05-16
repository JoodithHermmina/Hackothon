#!/bin/bash
# Script to synchronize ECS task definition versions between AWS and Terraform state

set -e

# Display help message
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
  echo "Usage: $0 [options]"
  echo "Synchronizes ECS task definition versions between AWS and Terraform state."
  echo ""
  echo "Options:"
  echo "  -c, --cluster CLUSTER  ECS cluster name (default: resume-builder-cluster)"
  echo "  -v, --verbose          Enable verbose output"
  echo "  -h, --help             Display this help message"
  exit 0
fi

# Parse command line arguments
CLUSTER="resume-builder-cluster"
VERBOSE=false
TERRAFORM_DIR="../terraform"

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--cluster)
      CLUSTER="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Change to the Terraform directory
cd "$(dirname "$0")"
cd $TERRAFORM_DIR

echo "=== Starting task definition synchronization ==="
echo "Cluster: $CLUSTER"

# Get actual task definitions used by services from AWS
echo "Checking task definitions used by AWS services..."

# Backend service
echo "Checking backend service..."
BACKEND_SERVICE_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services resume-backend-service \
  --query 'services[0].taskDefinition' \
  --output text)
  
echo "Backend service is using task definition: $BACKEND_SERVICE_TASK_DEF"

# Frontend service
echo "Checking frontend service..."
FRONTEND_SERVICE_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services resume-frontend-service \
  --query 'services[0].taskDefinition' \
  --output text)
  
echo "Frontend service is using task definition: $FRONTEND_SERVICE_TASK_DEF"

# Get task definitions from Terraform state
echo "Checking task definitions in Terraform state..."

# Extract task definition from Terraform state (if it exists)
if terraform state list | grep -q "aws_ecs_task_definition.backend"; then
  BACKEND_TF_TASK_DEF=$(terraform state show aws_ecs_task_definition.backend | grep "arn =" | head -1 | sed 's/.*= "\(.*\)".*/\1/')
  echo "Terraform backend task definition: $BACKEND_TF_TASK_DEF"
  
  # Check if they match
  if [[ "$BACKEND_SERVICE_TASK_DEF" != "$BACKEND_TF_TASK_DEF" ]]; then
    echo "Mismatch detected in backend task definition!"
    echo "Service is using: $BACKEND_SERVICE_TASK_DEF"
    echo "Terraform state has: $BACKEND_TF_TASK_DEF"
    
    echo -n "Do you want to sync the backend task definition? (y/n): "
    read SYNC_BACKEND
    
    if [[ "$SYNC_BACKEND" == "y" || "$SYNC_BACKEND" == "Y" ]]; then
      # Remove from state and reimport correct version
      echo "Syncing backend task definition..."
      terraform state rm aws_ecs_task_definition.backend
      terraform import aws_ecs_task_definition.backend "$BACKEND_SERVICE_TASK_DEF"
    else
      echo "Skipping backend task definition sync."
    fi
  else
    echo "Backend task definition versions match. No action needed."
  fi
else
  echo "Backend task definition not found in Terraform state."
  
  echo -n "Do you want to import the backend task definition? (y/n): "
  read IMPORT_BACKEND
  
  if [[ "$IMPORT_BACKEND" == "y" || "$IMPORT_BACKEND" == "Y" ]]; then
    echo "Importing backend task definition..."
    terraform import aws_ecs_task_definition.backend "$BACKEND_SERVICE_TASK_DEF"
  else
    echo "Skipping backend task definition import."
  fi
fi

# Do the same for frontend
if terraform state list | grep -q "aws_ecs_task_definition.frontend"; then
  FRONTEND_TF_TASK_DEF=$(terraform state show aws_ecs_task_definition.frontend | grep "arn =" | head -1 | sed 's/.*= "\(.*\)".*/\1/')
  echo "Terraform frontend task definition: $FRONTEND_TF_TASK_DEF"
  
  # Check if they match
  if [[ "$FRONTEND_SERVICE_TASK_DEF" != "$FRONTEND_TF_TASK_DEF" ]]; then
    echo "Mismatch detected in frontend task definition!"
    echo "Service is using: $FRONTEND_SERVICE_TASK_DEF"
    echo "Terraform state has: $FRONTEND_TF_TASK_DEF"
    
    echo -n "Do you want to sync the frontend task definition? (y/n): "
    read SYNC_FRONTEND
    
    if [[ "$SYNC_FRONTEND" == "y" || "$SYNC_FRONTEND" == "Y" ]]; then
      # Remove from state and reimport correct version
      echo "Syncing frontend task definition..."
      terraform state rm aws_ecs_task_definition.frontend
      terraform import aws_ecs_task_definition.frontend "$FRONTEND_SERVICE_TASK_DEF"
    else
      echo "Skipping frontend task definition sync."
    fi
  else
    echo "Frontend task definition versions match. No action needed."
  fi
else
  echo "Frontend task definition not found in Terraform state."
  
  echo -n "Do you want to import the frontend task definition? (y/n): "
  read IMPORT_FRONTEND
  
  if [[ "$IMPORT_FRONTEND" == "y" || "$IMPORT_FRONTEND" == "Y" ]]; then
    echo "Importing frontend task definition..."
    terraform import aws_ecs_task_definition.frontend "$FRONTEND_SERVICE_TASK_DEF"
  else
    echo "Skipping frontend task definition import."
  fi
fi

echo "=== Task definition synchronization completed ===" 