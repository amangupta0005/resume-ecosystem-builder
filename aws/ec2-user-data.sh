#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 User Data Bootstrap Script for Resume-ATS Platform
# OS: Ubuntu 24.04 LTS / 22.04 LTS | Instance: t3.micro / t2.micro (1GB RAM)
# ==============================================================================

set -euo pipefail
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=========================================================="
echo "🚀 Bootstrapping Resume-ATS Production Server on AWS EC2"
echo "=========================================================="

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg lsb-release git htop jq

# 2. Configure 2GB Swap Space (CRITICAL for 1GB RAM to prevent OOM kills)
if [ ! -f /swapfile ]; then
    echo "💾 Allocating 2GB Swap Space..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Set swappiness low so Linux prioritizes physical RAM
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ 2GB Swap Memory initialized."
fi

# 3. Install Docker Engine & Docker Compose v2 Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
    echo "✅ Docker installed and configured."
fi

# 4. Clone Resume-ATS Repository for ubuntu user
APP_DIR="/home/ubuntu/resume-ecosystem-builder"
if [ ! -d "$APP_DIR" ]; then
    echo "📂 Cloning repository into $APP_DIR..."
    git clone https://github.com/amangupta0005/resume-ecosystem-builder.git "$APP_DIR"
    chown -R ubuntu:ubuntu "$APP_DIR"
fi

# 5. Configure DuckDNS dynamic DNS auto-update on boot
echo "🌐 Configuring DuckDNS Dynamic DNS..."
cat << 'EOF' > /usr/local/bin/update-duckdns.sh
#!/bin/bash
TOKEN="700eec5c-37f1-483d-9656-4d5534ad81f4"
DOMAIN="aman-resumes"

for i in {1..12}; do
    RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=")
    if [ "$RESPONSE" = "OK" ]; then
        echo "[$(date)] DuckDNS updated successfully." >> /var/log/duckdns.log
        exit 0
    fi
    sleep 3
done
echo "[$(date)] DuckDNS update failed after 12 retries." >> /var/log/duckdns.log
exit 1
EOF

chmod +x /usr/local/bin/update-duckdns.sh

# Create systemd service for DuckDNS
cat << 'EOF' > /etc/systemd/system/duckdns.service
[Unit]
Description=DuckDNS dynamic DNS auto-update on boot
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/update-duckdns.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable duckdns.service
systemctl restart duckdns.service || true

# Add crontab fallback every 5 minutes
(crontab -u ubuntu -l 2>/dev/null | grep -v "update-duckdns"; echo "*/5 * * * * /usr/local/bin/update-duckdns.sh >/dev/null 2>&1") | crontab -u ubuntu -

# 6. Auto-start docker-compose if .env is present
if [ -f "$APP_DIR/.env" ]; then
    echo "🚀 Starting Docker Compose stack..."
    cd "$APP_DIR"
    docker compose up -d --build
fi

echo "=========================================================="
echo "🎉 Resume-ATS EC2 Bootstrap Complete!"
echo "Server Public IP: $(curl -s http://checkip.amazonaws.com || true)"
echo "=========================================================="
