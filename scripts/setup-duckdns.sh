#!/bin/bash
set -e

echo "=== Configuring Automatic DuckDNS Dynamic DNS on Boot ==="

# 1. Create the update script
sudo tee /usr/local/bin/update-duckdns.sh > /dev/null << 'EOF'
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

sudo chmod +x /usr/local/bin/update-duckdns.sh

# 2. Create systemd boot service
sudo tee /etc/systemd/system/duckdns.service > /dev/null << 'EOF'
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

# 3. Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable duckdns.service
sudo systemctl restart duckdns.service

# 4. Add crontab fallback every 5 minutes
(crontab -l 2>/dev/null | grep -v "update-duckdns"; echo "*/5 * * * * /usr/local/bin/update-duckdns.sh >/dev/null 2>&1") | crontab -

# 5. Ensure Docker starts on boot
sudo systemctl enable docker

echo "=== Status Check ==="
sudo systemctl status duckdns.service --no-pager
cat /var/log/duckdns.log
echo "Active crontab:"
crontab -l
echo "DuckDNS boot automation configured successfully!"
