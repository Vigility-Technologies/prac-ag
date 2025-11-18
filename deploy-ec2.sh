#!/bin/bash

# AWS EC2 Deployment Script
# This script automates the deployment of the GEM Bot application on AWS EC2

set -e

echo "🚀 Starting AWS EC2 Deployment..."

# Variables - UPDATE THESE
EC2_IP="your-ec2-public-ip"
KEY_FILE="path/to/your-key.pem"
APP_NAME="gem-bot"
REPO_URL="https://github.com/Vigility-Technologies/gem-agent.git"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Connecting to EC2 instance...${NC}"

# SSH command prefix
SSH_CMD="ssh -i $KEY_FILE ubuntu@$EC2_IP"

# Update and install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
$SSH_CMD << 'EOF'
    sudo apt update
    sudo apt upgrade -y
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2
    sudo npm install -g pm2
    
    # Install Nginx
    sudo apt install -y nginx
    
    # Install Git
    sudo apt install -y git
EOF

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Clone or update repository
echo -e "${BLUE}Deploying application code...${NC}"
$SSH_CMD << EOF
    if [ -d "$APP_NAME" ]; then
        cd $APP_NAME
        git pull origin main
    else
        git clone $REPO_URL $APP_NAME
        cd $APP_NAME
    fi
EOF

echo -e "${GREEN}✓ Code deployed${NC}"

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
$SSH_CMD << 'EOF'
    cd ~/gem-agent/nextjs-app/server
    npm install
    npm run build
    
    # Start or restart with PM2
    pm2 delete gem-bot-backend 2>/dev/null || true
    pm2 start dist/index.js --name gem-bot-backend
    pm2 save
EOF

echo -e "${GREEN}✓ Backend deployed${NC}"

# Setup frontend
echo -e "${BLUE}Setting up frontend...${NC}"
$SSH_CMD << 'EOF'
    cd ~/gem-agent/nextjs-app
    npm install
    npm run build
    
    # Start or restart with PM2
    pm2 delete gem-bot-frontend 2>/dev/null || true
    pm2 start npm --name "gem-bot-frontend" -- start
    pm2 save
EOF

echo -e "${GREEN}✓ Frontend deployed${NC}"

# Configure Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"
$SSH_CMD << 'EOF'
    sudo tee /etc/nginx/sites-available/gem-bot > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

    sudo ln -sf /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
EOF

echo -e "${GREEN}✓ Nginx configured${NC}"

# Display status
echo -e "${BLUE}Checking application status...${NC}"
$SSH_CMD "pm2 status"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend: ${BLUE}http://$EC2_IP${NC}"
echo -e "Backend:  ${BLUE}http://$EC2_IP/api${NC}"
echo ""
echo -e "To view logs:"
echo -e "  ${BLUE}ssh -i $KEY_FILE ubuntu@$EC2_IP${NC}"
echo -e "  ${BLUE}pm2 logs${NC}"
echo ""
