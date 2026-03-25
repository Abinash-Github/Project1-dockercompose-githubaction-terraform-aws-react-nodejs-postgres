variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name for resource naming and tags"
  type        = string
  default     = "user-management-app"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro is free tier)"
  type        = string
  default     = "t2.micro"
}

variable "instance_root_volume_size" {
  description = "Root volume size in GB (20GB is free tier limit)"
  type        = number
  default     = 20
}

variable "enable_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "docker_compose_path" {
  description = "Path to docker-compose.yml on EC2 instance"
  type        = string
  default     = "/home/ec2-user/app"
}

variable "app_port_frontend" {
  description = "Frontend application port"
  type        = number
  default     = 4172
}

variable "app_port_backend" {
  description = "Backend API port"
  type        = number
  default     = 7999
}

variable "ssh_key_name" {
  description = "Name of EC2 key pair (will be created by Terraform)"
  type        = string
  default     = "user-management-app-key"
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default = {
    Team    = "DevOps"
    CostCenter = "Engineering"
  }
}
