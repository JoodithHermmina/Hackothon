provider "aws" {
  region  = var.aws_region
}

# Store Terraform state in S3
terraform {
  backend "s3" {
    bucket = "resume-builder-tf-state-new"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

# Use existing ECR repositories
data "aws_ecr_repository" "resume_backend" {
  name = "resume-backend"
}

data "aws_ecr_repository" "resume_frontend" {
  name = "resume-frontend"
}

# VPC Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "resume-builder-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = var.environment
    Project     = "ResumeBuilder"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "resume_builder" {
  name = "resume-builder-cluster"
}

# Security Groups
resource "aws_security_group" "ecs_tasks" {
  name        = "resume-builder-ecs-tasks-sg"
  description = "Allow inbound traffic for ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = 5001
    to_port         = 5001
    security_groups = [aws_security_group.lb.id]
  }

  ingress {
    protocol        = "tcp"
    from_port       = 80
    to_port         = 80
    security_groups = [aws_security_group.lb.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "lb" {
  name        = "resume-builder-lb-sg"
  description = "Allow inbound traffic to load balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Load Balancer
resource "aws_lb" "resume_builder" {
  name               = "resume-builder-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = false

  tags = {
    Environment = var.environment
    Project     = "ResumeBuilder"
  }
  
  lifecycle {
    # This prevents Terraform from recreating the load balancer if it already exists
    ignore_changes = [
      name,
      subnets,
      security_groups
    ]
    # Import if exists, else create
    create_before_destroy = true
  }
}

# Target Groups
resource "aws_lb_target_group" "frontend" {
  name        = "resume-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 3
    interval            = 30
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = 5
    path                = "/"
    unhealthy_threshold = 3
  }
  
  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      name,
      port,
      protocol,
      vpc_id,
      target_type
    ]
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "resume-backend-tg"
  port        = 5001
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 3
    interval            = 30
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = 5
    path                = "/"
    unhealthy_threshold = 3
  }
  
  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      name,
      port,
      protocol,
      vpc_id,
      target_type
    ]
  }
}

# Listeners
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.resume_builder.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.frontend.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ECS Task Definitions
resource "aws_ecs_task_definition" "backend" {
  family                   = "resume-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = "arn:aws:iam::${var.aws_account_id}:role/resume-builder-ecs-execution-role"
  task_role_arn            = "arn:aws:iam::${var.aws_account_id}:role/resume-builder-ecs-task-role"

  container_definitions = jsonencode([
    {
      name      = "resume-backend"
      image     = "${data.aws_ecr_repository.resume_backend.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 5001
          hostPort      = 5001
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/resume-backend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
  
  lifecycle {
    # This prevents Terraform from trying to read the task definition before creating it
    ignore_changes = [
      # Ignore changes to tags
      tags,
      # Ignore changes to container definitions (including image tags)
      container_definitions,
      # Ignore changes to role ARNs
      execution_role_arn,
      task_role_arn
    ]
    # This ensures Terraform creates a new resource before destroying the old one
    create_before_destroy = true
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "resume-frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::${var.aws_account_id}:role/resume-builder-ecs-execution-role"
  task_role_arn            = "arn:aws:iam::${var.aws_account_id}:role/resume-builder-ecs-task-role"

  container_definitions = jsonencode([
    {
      name      = "resume-frontend"
      image     = "${data.aws_ecr_repository.resume_frontend.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/resume-frontend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
  
  lifecycle {
    # This prevents Terraform from trying to read the task definition before creating it
    ignore_changes = [
      # Ignore changes to tags
      tags,
      # Ignore changes to container definitions (including image tags)
      container_definitions,
      # Ignore changes to role ARNs
      execution_role_arn,
      task_role_arn
    ]
    # This ensures Terraform creates a new resource before destroying the old one
    create_before_destroy = true
  }
}

# ECS Services
resource "aws_ecs_service" "backend" {
  name            = "resume-backend-service"
  cluster         = aws_ecs_cluster.resume_builder.id
  task_definition = aws_ecs_task_definition.backend.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "resume-backend"
    container_port   = 5001
  }

  depends_on = [aws_lb_listener.frontend]
  
  lifecycle {
    # Ignore changes to task definition as it changes with each deployment
    ignore_changes = [
      task_definition,
      desired_count
    ]
    # This ensures Terraform creates a new resource before destroying the old one
    create_before_destroy = true
  }
}

resource "aws_ecs_service" "frontend" {
  name            = "resume-frontend-service"
  cluster         = aws_ecs_cluster.resume_builder.id
  task_definition = aws_ecs_task_definition.frontend.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "resume-frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.frontend]
  
  lifecycle {
    # Ignore changes to task definition as it changes with each deployment
    ignore_changes = [
      task_definition,
      desired_count
    ]
    # This ensures Terraform creates a new resource before destroying the old one
    create_before_destroy = true
  }
}

# IAM Roles
# First, try to import existing IAM roles with default value
data "aws_iam_role" "ecs_execution_role" {
  name = "resume-builder-ecs-execution-role"
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "resume-builder-ecs-execution-role"
  
  # Create if not exists in state
  count = 0

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  lifecycle {
    ignore_changes = [
      name,
      assume_role_policy
    ]
    create_before_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = "resume-builder-ecs-execution-role"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_role" "ecs_task_role" {
  name = "resume-builder-ecs-task-role"
}

resource "aws_iam_role" "ecs_task_role" {
  # Create if not exists in state
  count = 0
  name = "resume-builder-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  lifecycle {
    ignore_changes = [
      name,
      assume_role_policy
    ]
    create_before_destroy = true
  }
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/resume-frontend"
  retention_in_days = 30
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      name,
      retention_in_days
    ]
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/resume-backend"
  retention_in_days = 30
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      name,
      retention_in_days
    ]
  }
}
