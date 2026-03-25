# Terraform Configuration for User Management App

Complete Infrastructure as Code setup for deploying to AWS using Terraform.

---

## Overview

This Terraform configuration creates a production-ready AWS infrastructure on free tier:

- **VPC** with public subnet in ap-south-1 (India region)
- **EC2 t2.micro** instance with automated Docker + Docker Compose installation
- **Security Group** with necessary inbound/outbound rules
- **SSH Key Pair** auto-generated and stored locally
- **Elastic IP** for static public IP address

**Cost:** $0 (within 12 months free tier)

---

## Directory Structure

```
terraform/
├── providers.tf           # AWS provider configuration
├── variables.tf          # Input variable definitions
├── terraform.tfvars      # Variable values (customizable)
├── main.tf              # Main resource definitions
├── outputs.tf           # Output values
├── user_data.sh         # EC2 initialization script
├── .gitignore          # Exclude sensitive files
└── README.md           # This file

.ssh/                   # (Auto-created)
├── user-management-app-key.pem  # SSH private key
└── user-management-app-key.pub  # SSH public key
```

---

## File Descriptions

### `providers.tf`
Configures AWS provider and default tags for all resources.

```hcl
terraform {
  required_providers {
    aws = "~> 5.0"
  }
}

provider "aws" {
  region = var.aws_region
  # Auto-tags all resources with Project, Environment, ManagedBy
}
```

### `variables.tf`
Defines all input variables with descriptions and defaults.

**Key variables:**
- `aws_region` - Region for deployment (default: ap-south-1)
- `instance_type` - EC2 instance type (default: t2.micro - FREE)
- `vpc_cidr` - VPC CIDR block (default: 10.0.0.0/16)
- `app_port_frontend` - Frontend port mapping (default: 4172)
- `app_port_backend` - Backend API port (default: 7999)
- `ssh_key_name` - Name of SSH key pair

### `terraform.tfvars`
**This is the file you customize** with your specific values.

```hcl
aws_region              = "ap-south-1"  # Change region here
project_name            = "user-management-app"
instance_type           = "t2.micro"    # FREE tier
app_port_frontend       = 4172
app_port_backend        = 7999
```

### `main.tf`
Contains actual AWS resource definitions:

**Resources created:**
1. `data.aws_ami` - Fetches latest Ubuntu 22.04 AMI
2. `aws_vpc` - Virtual Private Cloud
3. `aws_internet_gateway` - Gateway for internet access
4. `aws_subnet` - Public subnet for EC2
5. `aws_route_table` - Routing rules
6. `aws_route_table_association` - Associate route table with subnet
7. `aws_security_group` - Firewall rules
8. `tls_private_key` - Generates RSA key pair
9. `aws_key_pair` - Uploads public key to AWS
10. `local_file` - Saves private key locally
11. `aws_instance` - EC2 instance with CloudInit
12. `aws_eip` - Elastic IP (static public IP)

### `outputs.tf`
Exports important values after deployment:

```
ec2_instance_id      - Instance ID
ec2_public_ip        - Public IP address
ec2_public_dns       - Public DNS name
ssh_command          - Ready-to-use SSH command
frontend_url         - Direct link to frontend
backend_url          - Direct link to backend API
ssh_key_path         - Where private key is stored
```

### `user_data.sh`
Bash script executed on EC2 instance startup. Installs:

- Docker
- Docker Compose
- Git
- Helpful tools (curl, wget, vim, tmux, htop)
- Creates app directory
- Gives `ec2-user` Docker permissions

---

## Prerequisites

### Local Machine
```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://www.terraform.io/downloads

# Verify installation
terraform version

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Key, Region (ap-south-1), Format (json)
```

### AWS Account
- Free tier account created
- AWS credentials configured (`aws configure`)
- No VPCs already using 10.0.0.0/16 (or change var.vpc_cidr)

---

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
```

This:
- Downloads AWS provider plugin
- Creates `.terraform/` directory
- Sets up local state file

### 2. Plan Deployment

```bash
terraform plan
```

Shows all resources that will be created. Review output carefully.

### 3. Apply Configuration

```bash
terraform apply
```

When prompted, type `yes` to proceed.

**This takes 2-3 minutes** while EC2 initializes.

### 4. Save Outputs

Terraform displays important information:

```
Outputs:

ec2_public_ip = "15.206.123.45"
frontend_url = "http://15.206.123.45:4172"
backend_url = "http://15.206.123.45:7999"
ssh_key_path = ".ssh/user-management-app-key.pem"
ssh_command = "ssh -i .ssh/user-management-app-key.pem -o StrictHostKeyChecking=no ec2-user@15.206.123.45"
```

Copy these for later use.

---

## Customization

### Change Region

Edit `terraform.tfvars`:

```hcl
aws_region = "us-east-1"  # Change from ap-south-1
```

Available free tier regions:
- `ap-south-1` (India)
- `us-east-1` (N. Virginia)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)

### Change Instance Type

```hcl
instance_type = "t2.small"  # Includes micro, small, medium
```

But note: **only t2.micro is FREE tier eligible**

### Change Application Ports

```hcl
app_port_frontend = 3000   # Change from 4172
app_port_backend = 8000    # Change from 7999
```

Also update `docker-compose.yml` ports to match.

### Add More Network Ranges

In `terraform.tfvars`, add custom tags or security rules:

Edit `main.tf` to add more ingress rules in `aws_security_group` block.

---

## Managing Terraform State

### Local State File (Default)

Terraform stores infrastructure state in `terraform.tfstate` (not in .git ignored by default, should be).

**Important:** This file is sensitive!

```bash
# Add to .gitignore
echo "terraform.tfstate*" >> .gitignore
```

### Remote State (Advanced - Optional)

For team collaboration, store state in S3:

```hcl
# Add to providers.tf
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "user-management-app/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

---

## Common Terraform Commands

```bash
# Show what will be created (without applying)
terraform plan

# Apply changes
terraform apply

# Destroy all resources
terraform destroy

# View current resources
terraform show

# View specific output
terraform output ec2_public_ip

# Format code
terraform fmt -recursive

# Validate syntax
terraform validate

# State management
terraform state list
terraform state show aws_instance.app

# Refresh state (sync with AWS)
terraform refresh
```

---

## SSH Access to EC2

### Using Terraform Output

```bash
# Get SSH command from outputs
terraform output ssh_command

# Or manually:
ssh -i .ssh/user-management-app-key.pem ec2-user@<PUBLIC_IP>
```

### Common SSH Issues

| Error | Solution |
|-------|----------|
| "Connection refused" | Wait 2-3 minutes for EC2 to initialize |
| "Permission denied" | Check file permissions: `chmod 600 .ssh/*.pem` |
| "No such file" | Verify key path is correct |
| "Host key verification failed" | Add `-o StrictHostKeyChecking=no` to SSH command |

---

## Monitoring Terraform-Created Resources

### Check EC2 Instance Status

```bash
# Via AWS CLI
aws ec2 describe-instances --region ap-south-1

# Via AWS Console: EC2 → Instances → Find your instance
```

### Check Costs

AWS Console → Billing Dashboard → Free Tier Usage

---

## Troubleshooting

### Terraform apply fails

**Error: "Error creating VPC"**
- Cause: Same CIDR already exists in region
- Solution: Change `vpc_cidr` in `terraform.tfvars`

**Error: "Invalid instance type"**
- Cause: Region doesn't support instance type
- Solution: Use `t2.micro` or `t2.small`

**Error: "AuthFailure"**
- Cause: AWS credentials invalid
- Solution: Run `aws configure` and verify credentials

### State file corrupted

```bash
# Restore from backup (if available)
cp terraform.tfstate.backup terraform.tfstate

# Or refresh state
terraform refresh
```

---

## Scaling Beyond Free Tier

When 12 months free tier expires or you want to scale:

### Option 1: Continue on Single Instance
```bash
# Runs on EC2 t2.micro: ~$7/month
```

### Option 2: Add Auto-Scaling
```hcl
# Replace single instance with Auto Scaling Group
resource "aws_autoscaling_group" "app" {
  # ... configuration
}
```

### Option 3: Migrate to ECS/Fargate
Create separate `ecs.tf` with:
- ECR repository
- ECS cluster
- Fargate task definition
- Load balancer

### Option 4: Use RDS for Database
Replace PostgreSQL container with managed RDS:
```hcl
resource "aws_db_instance" "postgres" {
  engine         = "postgres"
  instance_class = "db.t2.micro"  # FREE tier
}
```

---

## Security Best Practices

### 1. SSH Key Management
```bash
# Always keep .pem files private
chmod 600 .ssh/*.pem

# Never commit to git
# Already in .gitignore ✓
```

### 2. Security Group Rules
Current config allows:
- SSH from anywhere (restrict in production to your IP)
- App ports from anywhere (OK for demo)
- PostgreSQL only within VPC (✓ good)

Restrict SSH:
```hcl
# In main.tf, change SSH rule
ingress {
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["YOUR_IP/32"]  # Your IP only
}
```

### 3. Credentials in Environment Variables
Don't hardcode AWS credentials in Terraform files.
Use `aws configure` or environment variables:
```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="ap-south-1"
```

### 4. State File Encryption
Enable encryption for remote state (if using S3 backend):
```hcl
backend "s3" {
  encrypt = true
}
```

---

## Destroying Resources

When you no longer need the infrastructure:

```bash
cd terraform/

# Preview what will be deleted
terraform plan -destroy

# Delete everything
terraform destroy

# Confirm by typing 'yes'
```

This removes:
- EC2 instance
- VPC and subnets
- Security groups
- Elastic IP
- SSH key pair
- All associated resources

**Note:** EBS volumes are deleted by default (set `delete_on_termination = true`)

---

## Advanced: Multiple Environments

To manage dev, staging, and prod:

```
terraform/
├── environments/
│  ├── dev/
│  │  └── terraform.tfvars
│  ├── staging/
│  │  └── terraform.tfvars
│  └── prod/
│     └── terraform.tfvars
├── providers.tf
├── variables.tf
└── main.tf
```

Deploy each environment:
```bash
terraform apply -var-file="environments/prod/terraform.tfvars"
```

---

## Documentation & Resources

- [Terraform Official Docs](https://www.terraform.io/docs)
- [AWS Provider Reference](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/language/values/variables)
- [AWS Free Tier Limits](https://aws.amazon.com/free/)

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Run `terraform plan` to see current state
3. Check AWS Console for resource status
4. View Terraform logs: `TF_LOG=DEBUG terraform apply`

---

**Congratulations on Infrastructure as Code! 🚀**

Every resource is now version-controlled, reproducible, and auditable through Terraform.
