#!/bin/bash
set -e

# Redirect all output to log file
exec > /var/log/user-data.log 2>&1

echo "Starting setup at $(date)"

# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y \
  git \
  curl \
  wget \
  vim \
  htop \
  tmux \
  ca-certificates \
  gnupg \
  lsb-release

# Install Docker using official script
curl -fsSL https://get.docker.com | sh

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose plugin (v2 - uses 'docker compose' not 'docker-compose')
apt-get install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version

# Create app directory
mkdir -p ${docker_compose_path}
chown ubuntu:ubuntu ${docker_compose_path}

# Git config
git config --global user.email "devops@example.com" || true
git config --global user.name "DevOps Bot" || true

# Marker file
touch /tmp/deployment-ready.txt

echo "Setup completed at $(date)"
EOF