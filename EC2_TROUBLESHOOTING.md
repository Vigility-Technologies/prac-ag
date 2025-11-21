# EC2 Deployment Troubleshooting Guide

## Quick Diagnosis Commands

Run these commands on your EC2 instance to diagnose the issue:

```bash
# 1. Check if services are running
pm2 status

# 2. Check Nginx status
sudo systemctl status nginx

# 3. Check if ports are listening
sudo netstat -tlnp | grep -E ':(80|443|3000|5000)'

# 4. Check Nginx configuration
sudo nginx -t

# 5. View PM2 logs
pm2 logs --lines 50

# 6. Check system resources
free -h
df -h
```

---

## Common Issues & Fixes

### Issue 1: Services Not Running

**Symptoms:** PM2 shows no processes or stopped processes

**Fix:**

```bash
# Navigate to project directory
cd /home/ubuntu/gem-agent/nextjs-app

# Start backend
cd server
pm2 start dist/index.js --name gem-bot-backend

# Start frontend
cd ..
pm2 start npm --name "gem-bot-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

### Issue 2: Nginx Not Configured

**Symptoms:** `sudo systemctl status nginx` shows errors or not running

**Fix:**

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gem-bot
```

Paste this configuration:

```nginx
# Backend API
upstream backend {
    server localhost:5000;
}

# Frontend
upstream frontend {
    server localhost:3000;
}

# API Server
server {
    listen 80;
    server_name api.yourdomain.com;  # Change this or use IP

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Server
server {
    listen 80 default_server;
    server_name _;  # Catches all requests

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API proxy for /api/* requests
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable new configuration
sudo ln -sf /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Issue 3: Security Group Not Configured

**Check AWS Console:**

1. Go to EC2 → Instances → Select your instance
2. Click "Security" tab
3. Check "Security groups"
4. Ensure these ports are open:

| Type       | Port | Source                |
| ---------- | ---- | --------------------- |
| SSH        | 22   | Your IP               |
| HTTP       | 80   | 0.0.0.0/0, ::/0       |
| HTTPS      | 443  | 0.0.0.0/0, ::/0       |
| Custom TCP | 3000 | 0.0.0.0/0 (temporary) |
| Custom TCP | 5000 | 0.0.0.0/0 (temporary) |

**Add missing rules:**

```bash
# If using AWS CLI
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

---

### Issue 4: Environment Variables Not Set

**Check backend .env:**

```bash
cd /home/ubuntu/gem-agent/nextjs-app/server
cat .env
```

Should contain:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://your-ec2-ip
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-api-key
```

**Check frontend .env:**

```bash
cd /home/ubuntu/gem-agent/nextjs-app
cat .env.production
```

Should contain:

```env
NEXT_PUBLIC_API_URL=http://your-ec2-ip:5000
```

**If missing or wrong, fix and restart:**

```bash
# Edit files
nano server/.env
nano .env.production

# Rebuild and restart
cd server
npm run build
pm2 restart gem-bot-backend

cd ..
npm run build
pm2 restart gem-bot-frontend
```

---

### Issue 5: Build Failed

**Check if code is built:**

```bash
# Backend build check
ls -la /home/ubuntu/gem-agent/nextjs-app/server/dist/

# Frontend build check
ls -la /home/ubuntu/gem-agent/nextjs-app/.next/
```

**If missing, rebuild:**

```bash
cd /home/ubuntu/gem-agent/nextjs-app

# Backend
cd server
npm install
npm run build

# Frontend
cd ..
npm install
npm run build

# Restart services
pm2 restart all
```

---

### Issue 6: Firewall Blocking Connections

**Check UFW (if enabled):**

```bash
sudo ufw status

# If active, allow Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
```

---

## Step-by-Step Complete Setup

If nothing is working, run this complete setup:

```bash
#!/bin/bash
# Run this on your EC2 instance

# 1. Navigate to project
cd /home/ubuntu/gem-agent/nextjs-app

# 2. Setup backend environment
cat > server/.env << 'EOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
EOF

# 3. Setup frontend environment
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:5000
EOF

# 4. Build backend
cd server
npm install
npm run build

# 5. Build frontend
cd ..
npm install
npm run build

# 6. Stop existing PM2 processes
pm2 delete all

# 7. Start backend
cd server
pm2 start dist/index.js --name gem-bot-backend --env production

# 8. Start frontend
cd ..
pm2 start npm --name "gem-bot-frontend" -- start

# 9. Save PM2 config
pm2 save

# 10. Setup Nginx
sudo tee /etc/nginx/sites-available/gem-bot > /dev/null << 'NGINX_EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80 default_server;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# 11. Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/

# 12. Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# 13. Check status
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx

echo "=== Open Ports ==="
sudo netstat -tlnp | grep -E ':(80|3000|5000)'
```

**IMPORTANT:** Replace these in the script above:

- `YOUR_EC2_PUBLIC_IP` - Your EC2 public IP address
- `YOUR_PROJECT.supabase.co` - Your Supabase URL
- `your_supabase_service_key` - Your Supabase service key
- `change-this-to-a-secure-random-string` - Generate with: `openssl rand -base64 32`

---

## Verification Steps

### 1. Test Backend Directly

```bash
# On EC2
curl http://localhost:5000/health

# From your computer
curl http://YOUR_EC2_IP:5000/health
```

Expected response: `{"status":"ok","message":"GEM Bot API is running"}`

### 2. Test Frontend Directly

```bash
# On EC2
curl http://localhost:3000

# From your computer (if port 3000 is open)
curl http://YOUR_EC2_IP:3000
```

### 3. Test Through Nginx

```bash
# From your computer
curl http://YOUR_EC2_IP/
curl http://YOUR_EC2_IP/api/health
```

### 4. Browser Test

```text
http://YOUR_EC2_IP
```

---

## Get Real-Time Help

**Share these outputs with me:**

```bash
# 1. PM2 status
pm2 status

# 2. PM2 logs (last 20 lines)
pm2 logs --lines 20 --nostream

# 3. Nginx error log
sudo tail -n 50 /var/log/nginx/error.log

# 4. Nginx access log
sudo tail -n 20 /var/log/nginx/access.log

# 5. Check ports
sudo netstat -tlnp | grep -E ':(80|443|3000|5000)'

# 6. Security group info
# From AWS Console → EC2 → Security Groups

# 7. Environment variables (sanitized)
cd /home/ubuntu/gem-agent/nextjs-app
echo "Backend .env exists:" && test -f server/.env && echo "YES" || echo "NO"
echo "Frontend .env.production exists:" && test -f .env.production && echo "YES" || echo "NO"
```

---

## Common Error Messages

### "Connection refused"

- **Cause:** Service not running or firewall blocking
- **Fix:** Check PM2 status, security groups, and firewall

### "502 Bad Gateway"

- **Cause:** Nginx can't reach backend/frontend
- **Fix:** Verify services are running, check upstream configuration

### "404 Not Found"

- **Cause:** Nginx misconfiguration
- **Fix:** Check Nginx config, verify proxy_pass URLs

### "ERR_CONNECTION_TIMED_OUT"

- **Cause:** Security group not allowing traffic
- **Fix:** Open port 80 in security group

---

## Quick Commands Reference

```bash
# View all logs
pm2 logs

# Restart all services
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Check what's using port 80
sudo lsof -i :80

# Kill process on port 80 (if needed)
sudo kill -9 $(sudo lsof -t -i:80)

# View system resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Need More Help?

Please provide:

1. Your EC2 public IP address
2. Output of `pm2 status`
3. Output of `sudo systemctl status nginx`
4. Any error messages from `pm2 logs`
5. Screenshot of security group rules
