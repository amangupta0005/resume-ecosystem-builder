# ==============================================================================
# Terraform Infrastructure as Code for Resume-ATS (AWS EC2 + Docker)
# Region: eu-north-1 (Stockholm) | Free-Tier Eligible (t3.micro / t2.micro)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name tag for AWS resources"
  type        = string
  default     = "Resume-ATS"
}

variable "instance_type" {
  description = "EC2 Instance type (Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of the existing EC2 Key Pair for SSH access"
  type        = string
  default     = "resume-key"
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GiB (AWS Free Tier includes up to 30 GiB)"
  type        = number
  default     = 20
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. Fetch Latest Ubuntu 24.04 LTS AMI
# ------------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical official owner ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ------------------------------------------------------------------------------
# 2. Security Group (Ports 22, 80, 443, 3000)
# ------------------------------------------------------------------------------
resource "aws_security_group" "resume_ats_sg" {
  name        = "${lower(var.project_name)}-security-group"
  description = "Security group for Resume-ATS platform allowing HTTP, HTTPS, SSH, and App port"

  # SSH Access
  ingress {
    description = "SSH from anywhere (restricted in production)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP Traffic (Docker maps port 80 -> container Next.js 3000)
  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Traffic (TLS / SSL termination)
  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Direct Next.js App Port (Optional for development/direct verification)
  ingress {
    description = "Direct Next.js port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound Internet Access
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-SG"
  }
}

# ------------------------------------------------------------------------------
# 3. EC2 Instance Definition with 20GB gp3 Volume & User Data Bootstrap
# ------------------------------------------------------------------------------
resource "aws_instance" "resume_ats_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.resume_ats_sg.id]

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-Root-Volume"
    }
  }

  user_data = file("${path.module}/ec2-user-data.sh")

  tags = {
    Name = var.project_name
  }
}

# ------------------------------------------------------------------------------
# 4. Outputs for Verification
# ------------------------------------------------------------------------------
output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.resume_ats_server.id
}

output "public_ip" {
  description = "Public IPv4 address"
  value       = aws_instance.resume_ats_server.public_ip
}

output "public_dns" {
  description = "Public DNS hostname"
  value       = aws_instance.resume_ats_server.public_dns
}

output "security_group_id" {
  description = "Attached Security Group ID"
  value       = aws_security_group.resume_ats_sg.id
}
