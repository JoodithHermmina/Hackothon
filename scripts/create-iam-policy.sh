#!/bin/bash

# Required environment variables
required_vars=(
    "AWS_REGION"
    "AWS_ACCOUNT_ID"
    "APP_NAME"
    "ENVIRONMENT"
    "TF_STATE_BUCKET"
    "ECR_REPO_BACKEND"
    "ECR_REPO_FRONTEND"
)

# Check for required environment variables
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Read the template
policy_template=$(cat iam/github-actions-role-policy.json)

# Replace variables
policy=$(echo "$policy_template" | \
    sed "s/\${AWS_REGION}/$AWS_REGION/g" | \
    sed "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" | \
    sed "s/\${APP_NAME}/$APP_NAME/g" | \
    sed "s/\${ENVIRONMENT}/$ENVIRONMENT/g" | \
    sed "s/\${TF_STATE_BUCKET}/$TF_STATE_BUCKET/g" | \
    sed "s/\${ECR_REPO_BACKEND}/$ECR_REPO_BACKEND/g" | \
    sed "s/\${ECR_REPO_FRONTEND}/$ECR_REPO_FRONTEND/g")

# Output the policy
echo "$policy"

# If AWS CLI is available and --apply flag is provided, create/update the policy
if [ "$1" == "--apply" ] && command -v aws >/dev/null 2>&1; then
    policy_name="github-actions-role-policy"
    
    # Create or update the policy
    if aws iam get-policy --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/$policy_name" >/dev/null 2>&1; then
        # Policy exists, create new version
        aws iam create-policy-version \
            --policy-arn "arn:aws:iam::$AWS_ACCOUNT_ID:policy/$policy_name" \
            --policy-document "$policy" \
            --set-as-default
        echo "Policy updated successfully"
    else
        # Create new policy
        aws iam create-policy \
            --policy-name "$policy_name" \
            --policy-document "$policy"
        echo "Policy created successfully"
    fi
fi 