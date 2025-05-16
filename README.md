# Resume Builder Application

A full-stack application for building ThoughtWorks branded resumes with a professional PDF output.

## Architecture

- **Frontend**: React application with Material UI
- **Backend**: Flask API with LaTeX PDF generation
- **Deployment**: AWS ECS (Fargate) via Terraform
- **CI/CD**: GitHub Actions

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 16+
- Python 3.10+
- AWS CLI (for deployment)

### Running Locally

The simplest way to run the application locally is using the start script:

```bash
chmod +x start.sh
./start.sh
```

This will:
1. Check and kill any existing backend service running on port 5001
2. Start the backend server in a Python virtual environment
3. Install all dependencies for both frontend and backend
4. Start the frontend development server

### Using Docker Compose

You can use Docker Compose for a containerized application:

```bash
docker-compose up
```

#### Development vs Production Mode

Docker Compose can be configured for two modes:

1. **Production Mode (default)**:
   - Uses the regular Dockerfiles
   - Builds optimized, production-ready containers
   - More stable but doesn't support hot reloading
   - Frontend runs on Nginx, backend on Gunicorn

2. **Development Mode**:
   - Uses `Dockerfile.dev` for both services
   - Supports hot reloading (code changes reflect immediately)
   - To use development mode, uncomment the development configuration in `docker-compose.yml`

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD, which:

1. Runs tests for both frontend and backend
2. Builds Docker images for both frontend and backend
3. Pushes images to Amazon ECR
4. Deploys infrastructure using Terraform
5. Updates ECS services with new image versions
6. Monitors the application health

### Running Tests Locally

#### Backend Tests

```bash
cd Resume-Backend
# Create a virtual environment if needed
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install pytest pytest-cov pytest-mock

# Install LaTeX dependencies if testing PDF generation
# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra

# On macOS with Homebrew:
brew install --cask mactex

# Run tests
pytest tests/ --cov=.
```

#### Frontend Tests

```bash
cd resume-frontend
npm install --legacy-peer-deps
npm test
```

### Troubleshooting CI/CD Test Failures

If tests are failing in the CI/CD pipeline but passing locally:

1. **LaTeX Dependencies**: Ensure the CI/CD workflow installs the required LaTeX packages before running backend tests
2. **Directory Structure**: Check that required directories like `templates` and `static` exist in the CI environment
3. **Mock Behavior**: Tests that mock filesystem operations may behave differently in CI environments
4. **Environment Variables**: Set any required environment variables in the CI workflow

### Setting up the CI/CD Pipeline

1. **Required GitHub Secrets**

   Add the following secrets to your GitHub repository:

   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., us-east-1)
   - `APP_DOMAIN`: Your application domain name or load balancer DNS

2. **AWS IAM User Configuration**

   Create an IAM user with the following permissions:
   - AmazonECR-FullAccess
   - AmazonECS-FullAccess
   - AmazonS3FullAccess
   - AmazonVPCFullAccess
   - IAMFullAccess
   - CloudWatchLogsFullAccess
   - ElasticLoadBalancingFullAccess

   ```bash
   # Example AWS CLI command to create policy
   aws iam create-policy --policy-name GithubActionsCICD --policy-document file://cicd-policy.json

   # Attach policy to user
   aws iam attach-user-policy --user-name github-actions --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GithubActionsCICD
   ```

3. **Workflow Files**

   The repository contains two workflow files:
   - `ci-cd.yml`: Main pipeline for testing, building, and deploying
   - `monitoring.yml`: Scheduled checks of application health

## Infrastructure

The infrastructure is managed with Terraform and includes:

- VPC with public and private subnets
- Application Load Balancer
- ECS Cluster with Fargate tasks
- ECR repositories for Docker images
- CloudWatch Logs
- Security Groups
- IAM roles and policies

### Initial Terraform Setup

Before the first GitHub Actions run, you need to:

1. Create an S3 bucket for Terraform state:

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://resume-builder-tf-state-new
```

2. Create the ECR repositories:

```bash
aws ecr create-repository --repository-name resume-frontend
aws ecr create-repository --repository-name resume-backend
```

## Deployment

The application is automatically deployed when changes are pushed to the main branch.

### Manual Deployment Process

For manual deployment:

1. Build and push Docker images:

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd Resume-Backend
docker build -t <your-ecr-repo-url>/resume-backend:latest .
docker push <your-ecr-repo-url>/resume-backend:latest

# Build and push frontend
cd ../resume-frontend
docker build -t <your-ecr-repo-url>/resume-frontend:latest .
docker push <your-ecr-repo-url>/resume-frontend:latest
```

2. Apply Terraform changes:

```bash
cd ../terraform
terraform init
terraform apply
```

### Deployment Verification

After deployment is complete, verify the application is working properly:

```bash
# Get the application URL
cd terraform
APP_URL=$(terraform output -raw load_balancer_dns)

# Check the frontend
curl -I http://$APP_URL

# Check the backend API
curl -I http://$APP_URL/api
```
## Accessing the Application

After deployment, the application will be available at the Load Balancer DNS name, which can be found in the Terraform outputs:

```bash
cd terraform
terraform output load_balancer_dns
```

## Monitoring and Troubleshooting

The application is automatically monitored by GitHub Actions workflow that runs every 6 hours.

### Manual Health Checks

You can manually trigger the monitoring workflow from the GitHub Actions tab.

### Common Issues and Solutions

1. **Frontend cannot connect to backend**
   - Check the REACT_APP_API_URL environment variable during build
   - Verify the load balancer listener rules for /api paths

2. **PDF generation fails**
   - Ensure LaTeX dependencies are properly installed in the backend container
   - Check the CloudWatch logs for the backend service

3. **Application not accessible**
   - Verify security group rules allow traffic on port 80
   - Check ECS service status and events

