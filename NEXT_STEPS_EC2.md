# ✅ Services Running - Next Steps

## Current Status

✅ Backend running on port 5000
✅ Frontend running on port 3000
✅ PM2 managing both processes

## Run These Commands on EC2

### 1. Check Nginx Status

```bash
sudo systemctl status nginx
```

### 2. Check if Nginx is installed

```bash
which nginx
# If not found, install it:
sudo apt update
sudo apt install -y nginx
```

### 3. Check what's on port 80

```bash
sudo netstat -tlnp | grep :80
# OR
sudo lsof -i :80
```

### 4. Test if services respond locally

```bash
# Test backend
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

### 5. Check your EC2 Security Group

Go to AWS Console and verify port 80 is open:

- EC2 → Instances → Select your instance
- Security tab → Click security group name
- Inbound rules should have:
  - Type: HTTP, Port: 80, Source: 0.0.0.0/0

---

## Most Likely Issue: Nginx Not Configured

If Nginx is installed but not configured, run this:

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/gem-bot > /dev/null << 'EOF'
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
        proxy_set_header X-Real-IP $remote_addr;
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
EOF

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Enable new site
sudo ln -sf /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Start/Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## After Nginx is Running

### Test from your computer:

```bash
# Replace YOUR_EC2_IP with your actual EC2 public IP
curl http://YOUR_EC2_IP/
curl http://YOUR_EC2_IP/api/health
```

### Open in browser:

```
http://YOUR_EC2_IP
```

---

## If Nginx is Already Running

Check the configuration:

```bash
# View current config
sudo nginx -t
cat /etc/nginx/sites-enabled/*

# View error logs
sudo tail -50 /var/log/nginx/error.log

# View access logs
sudo tail -20 /var/log/nginx/access.log
```

---

## Quick Fix Script

Run this complete script on EC2:

```bash
#!/bin/bash
set -e

echo "Installing/configuring Nginx..."
sudo apt update
sudo apt install -y nginx

echo "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/gem-bot > /dev/null << 'EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "Enabling site..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/

echo "Testing configuration..."
sudo nginx -t

echo "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "Status check..."
sudo systemctl status nginx --no-pager

echo "Port check..."
sudo netstat -tlnp | grep :80

echo "Done! Test your site at: http://$(curl -s ifconfig.me)"
```

Save as `setup-nginx.sh`, make executable, and run:

```bash
nano setup-nginx.sh
# Paste the script above
chmod +x setup-nginx.sh
./setup-nginx.sh
```

---

## What to Share Next

Please share the output of:

```bash
sudo systemctl status nginx
sudo netstat -tlnp | grep :80
curl http://localhost:5000/health
curl http://localhost:3000
```

And your EC2 public IP so I can help test it!
