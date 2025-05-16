#!/bin/bash

# Stop on any error
set -e

# Default region
DEFAULT_REGION="us-east-1"
REGION=${1:-$DEFAULT_REGION}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ThoughtWorks Resume Builder - AWS Setup Script${NC}"
echo -e "${YELLOW}This script will set up the necessary AWS resources for CI/CD deployment${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null
then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to AWS
echo "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Not logged in to AWS. Please run 'aws configure' first."
    exit 1
fi

echo "Logged in as: $(aws sts get-caller-identity --query 'Arn' --output text)"
echo "Using region: $REGION"
echo ""

# Check if S3 bucket exists for storing Terraform state
echo "Checking if S3 bucket for Terraform state exists..."
if ! aws s3api head-bucket --bucket resume-builder-tf-state-new 2>/dev/null; then
  aws s3 mb s3://resume-builder-tf-state-new --region $REGION
  aws s3api put-bucket-versioning \
    --bucket resume-builder-tf-state-new \
    --versioning-configuration Status=Enabled
  echo "Created S3 bucket for Terraform state and enabled versioning"
else
  echo "S3 bucket for Terraform state already exists"
fi

# Create ECR repositories
echo -e "\nCreating ECR repositories..."
for repo in "resume-frontend" "resume-backend"; do
    if ! aws ecr describe-repositories --repository-names $repo --region $REGION 2>/dev/null; then
        aws ecr create-repository --repository-name $repo --region $REGION
        echo "ECR repository '$repo' created"
    else
        echo "ECR repository '$repo' already exists"
    fi
done

# Create IAM user for GitHub Actions
echo -e "\nCreating IAM policy for GitHub Actions..."
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='GithubActionsCICD'].Arn" --output text)

if [ -z "$POLICY_ARN" ]; then
    POLICY_ARN=$(aws iam create-policy \
        --policy-name GithubActionsCICD \
        --policy-document file://cicd-policy.json \
        --query 'Policy.Arn' --output text)
    echo "IAM policy created with ARN: $POLICY_ARN"
else
    echo "IAM policy already exists with ARN: $POLICY_ARN"
fi

echo -e "\nChecking for GitHub Actions IAM user..."
if ! aws iam get-user --user-name github-actions 2>/dev/null; then
    echo "Creating IAM user 'github-actions'..."
    aws iam create-user --user-name github-actions
    aws iam attach-user-policy --user-name github-actions --policy-arn $POLICY_ARN

    # Create access key
    echo "Creating access key for the IAM user..."
    ACCESS_KEY=$(aws iam create-access-key --user-name github-actions --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)

    ACCESS_KEY_ID=$(echo $ACCESS_KEY | cut -d' ' -f1)
    SECRET_ACCESS_KEY=$(echo $ACCESS_KEY | cut -d' ' -f2)

    echo -e "\n${YELLOW}Add these secrets to your GitHub repository:${NC}"
    echo -e "AWS_ACCESS_KEY_ID: ${GREEN}$ACCESS_KEY_ID${NC}"
    echo -e "AWS_SECRET_ACCESS_KEY: ${GREEN}$SECRET_ACCESS_KEY${NC}"
    echo -e "AWS_REGION: ${GREEN}$REGION${NC}"
else
    echo "IAM user 'github-actions' already exists"
    echo "If you need a new access key, run:"
    echo "aws iam create-access-key --user-name github-actions"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "Next steps:"
echo "1. Add the AWS secrets to your GitHub repository"
echo "2. Add the APP_DOMAIN secret (can be your load balancer DNS or domain name)"
echo "3. Push to main branch to trigger deployment"
