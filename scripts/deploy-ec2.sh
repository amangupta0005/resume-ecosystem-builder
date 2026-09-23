#!/bin/bash
# ==============================================================================
# Ultra-Low-Memory AWS EC2 Setup & Deployment Script (No Nginx, Direct Port 80)
# Designed for AWS Free-Tier t2.micro / t3.micro (1GB RAM)
# ==============================================================================

set -e

echo "=========================================="
echo "🚀 Starting Resume Ecosystem EC2 Setup"
echo "=========================================="

# 1. Update package lists
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Configure 2GB Swap Memory (CRUCIAL for 1GB RAM to prevent OOM killer)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 2GB Swap Space for 1GB RAM stability..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    # Optimize swappiness for low-RAM server
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo "✅ 2GB Swap Space active!"
else
    echo "✅ Swap Space already configured."
fi

# 3. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine & Docker Compose Plugin..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable and start Docker service
    sudo systemctl enable docker
    sudo systemctl start docker

    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
fi

# 4. Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Please create a .env file with your DATABASE_URL and APP_PASSCODE:"
    echo "cat << 'EOF' > .env"
    echo "DATABASE_URL=\"your-neon-database-url\""
    echo "APP_PASSCODE=\"your-passcode\""
    echo "EOF"
    exit 1
fi

# 5. Build and launch Docker Compose services
echo "🚢 Launching Docker Compose stack (Next.js Standalone + Redis on port 80)..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

echo "=========================================="
echo "🎉 Deployment Complete!"
echo "Your app is live directly on Port 80:"
echo "http://$(curl -s http://checkip.amazonaws.com)/"
echo "=========================================="
