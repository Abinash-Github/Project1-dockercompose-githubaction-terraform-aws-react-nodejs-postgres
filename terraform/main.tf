# Get the latest Ubuntu 22.04 AMI for ap-south-1
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical AWS account

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Create public subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# Create route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create security group
resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-"
  description = "Security group for User Management App"
  vpc_id      = aws_vpc.main.id

  # SSH access from anywhere (restrict in production)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # HTTP for frontend
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  # Frontend app port
  ingress {
    from_port   = var.app_port_frontend
    to_port     = var.app_port_frontend
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend application"
  }

  # Backend API port
  ingress {
    from_port   = var.app_port_backend
    to_port     = var.app_port_backend
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API"
  }

  # PostgreSQL (only for internal or specific IPs in production)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL access (VPC only)"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# Generate SSH key pair
resource "tls_private_key" "main" {
  algorithm = "RSA"
  rsa_bits  = 4096
  lifecycle {
    ignore_changes = all   # never regenerate once created
  }
}

# Create AWS key pair
resource "aws_key_pair" "main" {
  key_name   = var.ssh_key_name
  public_key = tls_private_key.main.public_key_openssh

  tags = {
    Name = "${var.project_name}-keypair"
  }
}

# Save private key locally (important: keep secure!)
resource "local_file" "private_key" {
  content         = tls_private_key.main.private_key_pem
  filename        = "${path.module}/../.ssh/${var.ssh_key_name}.pem"
  file_permission = "0600"
}

# Create EC2 instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.main.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]

  # Root volume configuration (20GB free tier)
  root_block_device {
    volume_type           = "gp2"
    volume_size           = var.instance_root_volume_size
    delete_on_termination = true
    tags = {
      Name = "${var.project_name}-root-volume"
    }
  }

  # CloudInit script to install Docker and Docker Compose
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    docker_compose_path = var.docker_compose_path
  }))

  monitoring                  = var.enable_monitoring
  associate_public_ip_address = true

  tags = {
    Name = "${var.project_name}-instance"
  }

  depends_on = [
    aws_internet_gateway.main
  ]
}

# Allocate Elastic IP for consistent IP address
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "${var.project_name}-eip"
  }
}
