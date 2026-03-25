# AWS Deployment Guide using Terraform & GitHub Actions

Complete step-by-step guide to deploy your User Management App to AWS using Terraform and GitHub Actions CI/CD pipeline.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: AWS Setup](#step-1-aws-setup)
4. [Step 2: Terraform Deployment](#step-2-terraform-deployment)
5. [Step 3: GitHub Secrets Configuration](#step-3-github-secrets-configuration)
6. [Step 4: GitHub Actions CI/CD](#step-4-github-actions-cicd)
7. [Step 5: First Deployment](#step-5-first-deployment)
8. [Accessing Your Application](#accessing-your-application)
9. [Troubleshooting](#troubleshooting)
10. [Cleanup](#cleanup)

---

## Architecture Overview

```
Your Local Machine
       ↓
   GitHub Repo
       ↓ (push to main)
GitHub Actions (Ubuntu-latest)
       ↓
  SSH to EC2
       ↓
EC2 t2.micro (ap-south-1) ◄─── Terraform creates this
├─ Docker
├─ Docker Compose
└─ 3 Containers:
   ├─ React Frontend (port 4172)
   ├─ Node.js Backend (port 7999)
   └─ PostgreSQL Database (port 5432)
```

**Cost: FREE (12 months free tier AWS)**

---

## Prerequisites

### Local Machine
- Terraform >= 1.0 (install from https://www.terraform.io/downloads)
- AWS CLI (optional but useful)
- Git
- SSH key already created by Terraform (we'll generate it)

### AWS Account
- Free tier account (https://aws.amazon.com/free)
- Logged in and ready to deploy

### GitHub
- Repository with this code pushed
- Access to GitHub Secrets

---

## Step 1: AWS Setup

### 1.1 Create AWS Account (if not done)
1. Go to https://aws.amazon.com/free
2. Click "Create a Free Account"
3. Complete signup and verify email
4. Add payment method (won't be charged for free tier)

### 1.2 Set Up AWS Credentials Locally

```bash
# Install AWS CLI (if not already installed)
# macOS:
brew install awscli

# Configure AWS credentials
aws configure

# When prompted, enter:
# AWS Access Key ID: [Get from AWS Console]
# AWS Secret Access Key: [Get from AWS Console]
# Default region: ap-south-1
# Default output format: json
```

**To get AWS credentials:**
1. Log in to AWS Console
2. Go to **IAM** → **Users** → Your user
3. Click **Security credentials** tab
4. Scroll to **Access keys**
5. Click **Create access key** → **Command Line Interface (CLI)**
6. Download the `.csv` file or copy the credentials

---

## Step 2: Terraform Deployment

### 2.1 Navigate to Terraform Directory

```bash
cd terraform/
```

### 2.2 Initialize Terraform

```bash
terraform init
```

This downloads AWS provider and prepares your working directory.

### 2.3 Review the Plan

```bash
terraform plan
```

This shows what Terraform will create without making changes. Review the output carefully.

### 2.4 Apply Terraform Configuration

```bash
terraform apply
```

When prompted, type `yes` to proceed.

**This will create:**
- VPC and networking infrastructure
- Security group with required ports
- EC2 t2.micro instance in ap-south-1
- SSH key pair (saved as `.ssh/user-management-app-key.pem`)
- Elastic IP for static public IP address

### 2.5 Important: Save Terraform Outputs

After `terraform apply` completes, you'll see:

```
Outputs:

ec2_public_ip = "1.2.3.4"
frontend_url = "http://1.2.3.4:4172"
backend_url = "http://1.2.3.4:7999"
ssh_command = "ssh -i .ssh/user-management-app-key.pem -o StrictHostKeyChecking=no ec2-user@1.2.3.4"
ssh_key_path = ".ssh/user-management-app-key.pem"
```

**Copy and save these values — you'll need them in the next steps.**

### 2.6 Verify SSH Access (Optional)

```bash
# Test SSH connection to your new EC2 instance
ssh -i .ssh/user-management-app-key.pem -o StrictHostKeyChecking=no ec2-user@<PUBLIC_IP>

# You should see a prompt. Type 'exit' to logout.
# (EC2 may still be initializing Docker, so give it 2-3 minutes)
```

---

## Step 3: GitHub Secrets Configuration

GitHub Actions needs credentials to deploy to your EC2 instance.

### 3.1 Add SSH Private Key as Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**First Secret: EC2_SSH_PRIVATE_KEY**

4. Name: `EC2_SSH_PRIVATE_KEY`
5. Value: Copy contents of `.ssh/user-management-app-key.pem`

```bash
# Print the private key (from terraform directory)
cat .ssh/user-management-app-key.pem
```

**⚠️ Important:** Copy the entire file including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

6. Click **Add secret**

### 3.2 Add EC2 Public IP as Secret

1. Click **New repository secret**

**Second Secret: EC2_PUBLIC_IP**

2. Name: `EC2_PUBLIC_IP`
3. Value: Paste the `ec2_public_ip` from Terraform outputs (e.g., `1.2.3.4`)
4. Click **Add secret**

### 3.3 (Optional) Add AWS Account ID

If you plan to use ECR later:

1. Click **New repository secret**
2. Name: `AWS_ACCOUNT_ID`
3. Value: Your AWS account ID (12-digit number from AWS Console)
4. Click **Add secret**

---

## Step 4: GitHub Actions CI/CD

The workflow is ready! Review the file: `.github/workflows/deploy-aws.yml`

**What it does on every push to main:**
1. Checkout your code
2. SSH into EC2
3. Clone/pull latest code
4. Stop old containers
5. Build new Docker images
6. Start containers with `docker compose up -d`
7. Wait for services to be healthy
8. Run API tests
9. Report success/failure

---

## Step 5: First Deployment

### 5.1 Push Code to GitHub (main branch)

```bash
cd /path/to/your/project

git add .
git commit -m "DevOps: Add AWS infrastructure and GitHub Actions deployment"
git push origin main
```

### 5.2 Watch Deployment in GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click the latest workflow run titled "Deploy to AWS"
4. Click **Deploy to EC2** job to see real-time logs

**Expected duration: 5-15 minutes**

The workflow will:
- Checkout code
- SSH to EC2
- Clone repository
- Build Docker images (~3-5 min)
- Start containers (~1-2 min)
- Wait for services (~1-2 min)
- Run tests (~1 min)
- Report success

### 5.3 Monitor the Deployment

Watch for green checkmarks (✓) next to each step:
- ✓ Checkout code
- ✓ Clone repository on EC2
- ✓ Start Docker Compose on EC2
- ✓ Wait for PostgreSQL
- ✓ Wait for Backend API
- ✓ Wait for Frontend
- ✓ Run API Tests

If you see a ✗ (red X), click that step to see the error.

---

## Accessing Your Application

### Once deployment succeeds:

**Frontend:** 
```
http://<EC2_PUBLIC_IP>:4172
```

**Backend API:** 
```
http://<EC2_PUBLIC_IP>:7999/users/all
```

**Example** (if public IP is 1.2.3.4):
- Frontend: http://1.2.3.4:4172
- Backend: http://1.2.3.4:7999/users/all

### SSH into your instance (for debugging):

```bash
ssh -i .ssh/user-management-app-key.pem ec2-user@<EC2_PUBLIC_IP>
```

Once connected:
```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Check specific service
docker compose logs server
docker compose logs client
docker compose logs postgres

# Manually run docker compose commands
cd /home/ec2-user/app
docker compose down
docker compose up -d
```

---

## Troubleshooting

### ❌ GitHub Actions Deployment Failed

**Check logs:**
1. Go to GitHub repo → **Actions**
2. Click the failed workflow
3. Expand the failed step to see error details

### 🔴 "SSH connection refused"

**Cause:** EC2 is still initializing (takes 2-3 minutes)

**Solution:** 
- Wait 3-5 minutes after Terraform apply
- Re-run the GitHub Actions workflow:
  1. Go to **Actions**
  2. Click the workflow
  3. Click **Re-run all jobs**

### 🔴 "docker compose: command not found"

**Cause:** Docker Compose not finished installing

**Solution:**
```bash
# SSH into instance
ssh -i .ssh/user-management-app-key.pem ec2-user@<IP>

# Wait for installation
sleep 60

# Check installation
docker compose --version
```

### 🔴 "Port already in use"

**Cause:** Old containers still running

**Solution:**
```bash
# SSH into instance
ssh -i .ssh/user-management-app-key.pem ec2-user@<IP>

# Stop all containers
docker compose down

# Remove all containers
docker system prune -af
```

### 🔴 "Backend not responding" (in tests)

**Cause:** Database migration failed

**Solution:**
```bash
# SSH into instance
ssh -i .ssh/user-management-app-key.pem ec2-user@<IP>

# Check database logs
docker compose logs postgres

# Check server logs
docker compose logs server

# Try manual fixes
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

### 🔴 "Cannot clone repository on EC2"

**Cause:** Repository is private, EC2 doesn't have access

**Solution (for public repo):** No solution needed, already handled

**Solution (for private repo):**
1. Create GitHub Personal Access Token (PAT)
2. Add as GitHub secret: `GITHUB_PAT`
3. Update workflow to use: `https://<user>:<GITHUB_PAT>@github.com/...`

---

## Making Changes & Redeploying

The beauty of CI/CD: **simply push code to main!**

```bash
# Make a change
nano client/src/pages/Home/index.jsx

# Commit
git add .
git commit -m "Feature: improve home page layout"

# Push to main (triggers automatic deployment)
git push origin main

# Watch deployment in GitHub Actions
```

All without manual SSH or docker commands. The GitHub Actions workflow handles everything!

---

## Monitoring Your Deployment

### Check Application Status

```bash
# From your local machine
ssh -i .ssh/user-management-app-key.pem ec2-user@<IP>

# On EC2
docker compose ps
docker compose logs --tail=50
```

### View CloudWatch Logs (AWS Console)

1. Go to AWS Console → **CloudWatch**
2. Click **Log Groups**
3. Look for `/aws/ec2/user-management-app` (if configured)

---

## Cost Tracking

AWS Free Tier includes (for 12 months):
- ✓ 750 hours EC2 t2.micro/month
- ✓ 20 GB EBS storage
- ✓ Free data transfer (limited)
- ✓ Free CloudWatch logs

**Monitor free tier usage:**
1. AWS Console → **Billing Dashboard**
2. Check "Free Tier Usage"
3. Set up billing alerts if approaching limits

---

## Cleanup (Stop Paying After Free Tier)

When 12 months end or you want to stop:

### Option 1: Keep Infrastructure (Will Cost $)

```bash
# Just stop the instance (no charges for stopped instance, only storage)
aws ec2 stop-instances --instance-ids <instance-id> --region ap-south-1
```

### Option 2: Destroy Everything (Recommended to Save Money)

```bash
cd terraform/

# See what will be deleted
terraform plan -destroy

# Delete all resources
terraform destroy

# Type 'yes' when prompted
```

This removes:
- EC2 instance
- VPC and networking
- Security groups
- Elastic IP
- SSH key pair

---

## Advanced: Custom Domain with HTTPS

To add a custom domain (optional, costs extra):

1. **Buy domain** (Route53, Namecheap, GoDaddy, etc.)
2. **Create SSL certificate** (AWS Certificate Manager - free)
3. **Update security group** to allow port 443
4. **Configure reverse proxy** (Nginx on EC2) or **CloudFront**

(Detailed guide can be created if needed)

---

## Next Steps

✅ **Infrastructure:** EC2 instance with Docker deployed  
✅ **CI/CD:** GitHub Actions auto-deploys on push  
✅ **Application:** Frontend(4172) + Backend(7999) + Database running

**Options to explore:**
- [ ] Add custom domain with HTTPS
- [ ] Set up monitoring/alerts
- [ ] Implement RDS PostgreSQL (managed database)
- [ ] Add load balancer and auto-scaling
- [ ] Implement private Docker registry (ECR)
- [ ] Set up database backups

---

## Support

If you encounter issues:

1. Check **Troubleshooting** section above
2. View full GitHub Actions logs
3. SSH into instance and check `docker compose logs`
4. Check AWS CloudWatch logs

---

**Congratulations! 🎉 You now have a production-grade DevOps setup!**

GitHub Copilot DevOps Setup  
Terraform + GitHub Actions + AWS EC2  
Free Tier Friendly
