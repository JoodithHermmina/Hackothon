# GitHub Actions OIDC Authentication Setup

This directory contains the necessary IAM policies for setting up OpenID Connect (OIDC) authentication between GitHub Actions and AWS.

## Setup Instructions

1. Create an OIDC Provider in AWS IAM:
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
```

2. Create the IAM Role:
```bash
# Create the role with trust policy
aws iam create-role \
  --role-name github-actions-oidc-role \
  --assume-role-policy-document file://github-actions-oidc-trust-policy.json

# Attach the role policy
aws iam put-role-policy \
  --role-name github-actions-oidc-role \
  --policy-name github-actions-permissions \
  --policy-document file://github-actions-role-policy.json
```

## Policy Details

- `github-actions-oidc-trust-policy.json`: Defines the trust relationship that allows GitHub Actions to assume the role
- `github-actions-role-policy.json`: Defines the permissions granted to GitHub Actions, including:
  - Access to AWS Secrets Manager for retrieving secrets
  - Access to Amazon ECR for container operations

## Important Notes

1. The OIDC provider needs to be created only once per AWS account
2. The role ARN in the GitHub Actions workflow must match the role created here
3. The trust policy is configured to only allow access from the main branch of the repository 