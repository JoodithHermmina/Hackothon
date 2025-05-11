#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment variables
SECRET_NAME="resume-builder/dev/app-secrets"
AWS_REGION="ap-south-1"
REQUIRED_SECRETS="AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_ACCOUNT_ID APP_DOMAIN"

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        echo -e "${RED}Error: $3${NC}"
    fi
}

echo -e "${YELLOW}Starting AWS Secrets Manager Integration Test${NC}"
echo "----------------------------------------"

# Test 1: AWS CLI Installation
echo "Testing AWS CLI installation..."
if ! command -v aws &> /dev/null; then
    print_status 1 "AWS CLI Check" "AWS CLI is not installed"
    exit 1
fi
print_status 0 "AWS CLI Check"

# Test 2: AWS Credentials
echo -e "\nTesting AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_status 1 "AWS Credentials Check" "Invalid or missing AWS credentials"
    exit 1
fi
print_status 0 "AWS Credentials Check"

# Test 3: Secret Existence
echo -e "\nTesting secret existence..."
if ! aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$AWS_REGION" &> /dev/null; then
    print_status 1 "Secret Existence Check" "Secret '$SECRET_NAME' not found"
    exit 1
fi
print_status 0 "Secret Existence Check"

# Test 4: Secret Access and Format
echo -e "\nTesting secret access and format..."
if ! SECRETS=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query SecretString \
    --output text); then
    print_status 1 "Secret Access Check" "Unable to access secret value"
    exit 1
fi

# Validate JSON format
if ! echo "$SECRETS" | jq empty &> /dev/null; then
    print_status 1 "Secret Format Check" "Invalid JSON format"
    exit 1
fi
print_status 0 "Secret Format Check"

# Test 5: Required Fields
echo -e "\nTesting required fields..."
MISSING_SECRETS=()
for secret in $REQUIRED_SECRETS; do
    if ! echo "$SECRETS" | jq -e "has(\"$secret\")" > /dev/null; then
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -ne 0 ]; then
    print_status 1 "Required Fields Check" "Missing required secrets: ${MISSING_SECRETS[*]}"
    exit 1
fi
print_status 0 "Required Fields Check"

# Test 6: Values Validation
echo -e "\nTesting secret values..."
INVALID_SECRETS=()
for secret in $REQUIRED_SECRETS; do
    VALUE=$(echo "$SECRETS" | jq -r ".$secret")
    if [ "$VALUE" == "null" ] || [ -z "$VALUE" ]; then
        INVALID_SECRETS+=("$secret")
    fi
done

if [ ${#INVALID_SECRETS[@]} -ne 0 ]; then
    print_status 1 "Values Validation Check" "Empty or null values found for: ${INVALID_SECRETS[*]}"
    exit 1
fi
print_status 0 "Values Validation Check"

# Test 7: GitHub Actions Environment Simulation
echo -e "\nTesting GitHub Actions environment simulation..."
# Create temporary workflow test file
TEMP_WORKFLOW_DIR=".github/workflows/test"
mkdir -p "$TEMP_WORKFLOW_DIR"
cat > "$TEMP_WORKFLOW_DIR/test-env.sh" << 'EOF'
export GITHUB_OUTPUT="/tmp/github_output_test"
export GITHUB_ENV="/tmp/github_env_test"
touch "$GITHUB_OUTPUT"
touch "$GITHUB_ENV"
EOF

source "$TEMP_WORKFLOW_DIR/test-env.sh"

# Test secret masking and output
echo "::add-mask::test_mask" >> "$GITHUB_OUTPUT"
echo "test_var=test_value" >> "$GITHUB_ENV"

if [ ! -f "$GITHUB_OUTPUT" ] || [ ! -f "$GITHUB_ENV" ]; then
    print_status 1 "GitHub Environment Check" "Unable to simulate GitHub environment"
    rm -rf "$TEMP_WORKFLOW_DIR"
    exit 1
fi

rm -rf "$TEMP_WORKFLOW_DIR"
print_status 0 "GitHub Environment Check"

echo -e "\n${GREEN}All tests completed successfully!${NC}"
echo "----------------------------------------" 