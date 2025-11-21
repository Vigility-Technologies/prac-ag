# AWS Deployment Guide for GEM Bid Management System

## Architecture Overview

This guide covers deploying:

- **Frontend**: Next.js application
- **Backend**: Express.js API server
- **Database**: Supabase (already hosted)

## Deployment Options

### Option 1: AWS Amplify (Frontend) + EC2 (Backend) - Recommended

- **Frontend**: AWS Amplify for Next.js
- **Backend**: EC2 instance for Express server
- **Cost**: ~$15-30/month
- **Best for**: Production with moderate traffic

### Option 2: Full EC2 Deployment

- **Both Frontend & Backend**: Single EC2 instance
- **Cost**: ~$10-20/month
- **Best for**: Cost-effective, low-moderate traffic

### Option 3: AWS ECS/Fargate (Containerized)

- **Both**: Docker containers on ECS
- **Cost**: ~$30-50/month
- **Best for**: Scalable production

---

## Prerequisites

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured
3. **Domain name** (optional but recommended)
4. **Supabase credentials** ready

---

## Option 1: AWS Amplify + EC2 (Recommended)

### Part A: Deploy Backend on EC2

#### Step 1: Launch EC2 Instance

```bash
# 1. Go to AWS Console → EC2 → Launch Instance
# 2. Choose:
#    - Name: gem-bot-backend
#    - AMI: Ubuntu Server 22.04 LTS
#    - Instance type: t3.micro (free tier) or t3.small
#    - Key pair: Create new or use existing
#    - Security Group: Create with these rules:
#      * SSH (22) - Your IP
#      * HTTP (80) - 0.0.0.0/0
#      * HTTPS (443) - 0.0.0.0/0
#      * Custom TCP (5000) - 0.0.0.0/0
```

#### Step 2: Connect and Setup Server

```bash
# Connect to your instance
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### Step 3: Deploy Backend Code

```bash
# Clone your repository
cd /home/ubuntu
git clone https://github.com/Vigility-Technologies/gem-agent.git
cd gem-agent/nextjs-app/server

# Install dependencies
npm install

# Create environment file
nano .env
```

Add to `.env`:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
GEMINI_API_KEY=your-gemini-api-key
```

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name gem-bot-backend
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/gem-bot-backend
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # or your-ec2-ip

    location / {
        proxy_pass http://localhost:5000;
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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gem-bot-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

### Part B: Deploy Frontend on AWS Amplify

#### Step 1: Prepare Frontend

Create `nextjs-app/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# OR if using EC2 IP directly:
NEXT_PUBLIC_API_URL=http://your-ec2-public-ip
```

#### Step 2: Deploy to Amplify

1. **Go to AWS Amplify Console**
2. **New App → Host web app**
3. **Connect to GitHub**

   - Select repository: `Vigility-Technologies/gem-agent`
   - Branch: `main`
   - Root directory: `nextjs-app`

4. **Build Settings** (auto-detected, verify):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

1. **Environment Variables**:

   - Add `NEXT_PUBLIC_API_URL` with your backend URL

2. **Deploy** and wait for completion

---

## Option 2: Full EC2 Deployment (Detailed Steps)

### Step 1: Launch EC2 Instance for Full Deployment

Same as Option 1, Part A, Step 1

### Step 2: Setup Server

Same as Option 1, Part A, Step 2

### Step 3: Deploy Both Frontend and Backend

```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/Vigility-Technologies/gem-agent.git
cd gem-agent/nextjs-app

# Setup Backend
cd server
npm install
nano .env
# Add environment variables as shown above
npm run build
pm2 start dist/index.js --name gem-bot-backend
cd ..

# Setup Frontend
npm install
nano .env.production
# Add NEXT_PUBLIC_API_URL=http://localhost:5000 or your domain
npm run build
pm2 start npm --name "gem-bot-frontend" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx for Both

```bash
sudo nano /etc/nginx/sites-available/gem-bot
```

Add:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gem-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 3: Docker + AWS ECS/Fargate

### Step 1: Create Dockerfiles

I'll create these files for you in the next section.

### Step 2: Push to ECR

```bash
# Install AWS CLI and configure
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name gem-bot-frontend
aws ecr create-repository --repository-name gem-bot-backend

# Build and push
# (Commands will be in the docker compose file)
```

### Step 3: Deploy to ECS

Use AWS Console or AWS CLI to create ECS cluster and services.

---

## Post-Deployment Steps

### 1. Update CORS Settings

Update backend CORS to include your frontend domain:

```typescript
// server/src/index.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

### 2. Setup Domain (Optional)

**Using Route 53:**

1. Register or transfer domain to Route 53
2. Create a record pointing to EC2 elastic IP
3. For Amplify, it provides a subdomain or you can add custom domain

### 3. Monitoring

```bash
# View logs on EC2
pm2 logs gem-bot-backend
pm2 logs gem-bot-frontend

# Monitor processes
pm2 monit

# Check server resources
htop
```

### 4. Backups

- Database: Supabase handles this
- Code: Git repository
- Consider setting up AWS S3 backups for uploads

### 5. Security Hardening

```bash
# Setup UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh

# Keep system updated
sudo apt update && sudo apt upgrade -y
```

---

## Maintenance Commands

### Update Application

```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Pull latest code
cd /home/ubuntu/gem-agent/nextjs-app
git pull origin main

# Update backend
cd server
npm install
npm run build
pm2 restart gem-bot-backend

# Update frontend (if on EC2)
cd ..
npm install
npm run build
pm2 restart gem-bot-frontend
```

### Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs --lines 100

# Monitor resources
pm2 monit
```

---

## Cost Estimation

### Option 1 (Amplify + EC2)

- EC2 t3.micro: $7-10/month
- Amplify: $0-15/month (depending on traffic)
- Data transfer: $5-10/month
- **Total: ~$15-35/month**

### Option 2 (Full EC2)

- EC2 t3.small: $15-20/month
- Data transfer: $5-10/month
- **Total: ~$20-30/month**

### Option 3 (ECS Fargate)

- Fargate tasks: $30-40/month
- Load balancer: $16/month
- **Total: ~$46-56/month**

---

## Troubleshooting

### Backend not connecting to frontend

- Check CORS settings
- Verify FRONTEND_URL in backend .env
- Check security group rules

### SSL certificate issues

- Ensure DNS is pointing to your server
- Wait 10-15 minutes for DNS propagation
- Check with: `sudo certbot certificates`

### PM2 not restarting on reboot

```bash
pm2 startup
pm2 save
```

### High memory usage

```bash
# Restart services
pm2 restart all

# Check memory
free -h
```

---

## Next Steps

1. Choose your deployment option
2. Follow the steps for that option
3. Test thoroughly in production
4. Setup monitoring and alerts
5. Document your specific configuration

Need help with any specific step? Let me know!
