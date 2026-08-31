#!/usr/bin/env bash
# Deploy Dr. Sudharsan's Children's Clinic app on Ubuntu.
# Run this ON THE SERVER, from the folder that contains clinic-app/.
# Usage: sudo bash deploy_ubuntu.sh yourdomain.or.ip

set -euo pipefail
DOMAIN="${1:-_}"   # pass a domain/IP, or leave blank to match any host
APP_DIR="$(pwd)/clinic-app"

echo "==> Installing system dependencies"
sudo apt update
sudo apt install -y curl build-essential python3 nginx

echo "==> Installing Node.js 20.x"
if ! command -v node >/dev/null || [[ "$(node -v)" < "v18" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Installing PM2"
sudo npm install -g pm2

echo "==> Building backend"
cd "$APP_DIR/backend"
npm install
npm run build
pm2 delete clinic-backend 2>/dev/null || true
pm2 start dist/index.js --name clinic-backend
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n1 | sudo bash || true

echo "==> Building frontend"
cd "$APP_DIR/frontend"
npm install
npm run build

echo "==> Configuring Nginx"
sudo tee /etc/nginx/sites-available/clinic > /dev/null << NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    root ${APP_DIR}/frontend/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/clinic /etc/nginx/sites-enabled/clinic
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Opening firewall (if ufw is active)"
if command -v ufw >/dev/null && sudo ufw status | grep -q "Status: active"; then
  sudo ufw allow 'Nginx Full'
fi

echo ""
echo "Done. Backend running under PM2 as 'clinic-backend' on :4000."
echo "Frontend served by Nginx at http://${DOMAIN}"
echo "For HTTPS on a real domain, run: sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d ${DOMAIN}"
