# Quick Deployment Guide

## Choose Your Deployment Method

### 🚀 Option 1: AWS EC2 (Recommended for beginners)
**Time**: 30-45 minutes  
**Cost**: ~$10-20/month  
**Best for**: Full control, moderate traffic

```bash
# 1. Update the script with your details
nano deploy-ec2.sh
# Edit: EC2_IP, KEY_FILE

# 2. Make sure you have your environment variables
cp .env.example .env
nano .env
# Fill in: JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL

# 3. Run deployment
./deploy-ec2.sh
```

**What it does:**
- Installs Node.js, PM2, Nginx on EC2
- Clones and builds your application
- Starts services with PM2
- Configures Nginx as reverse proxy

**After deployment:**
- Access frontend: `http://your-ec2-ip`
- Access backend: `http://your-ec2-ip/api`

---

### 🐳 Option 2: Docker (Easiest local/VPS deployment)
**Time**: 10-15 minutes  
**Cost**: Depends on hosting  
**Best for**: Any server with Docker

```bash
# 1. Install Docker and Docker Compose
# On Ubuntu:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose

# 2. Setup environment
cp .env.example .env
nano .env
# Fill in all variables

# 3. Deploy
./deploy-docker.sh
```

**What it does:**
- Builds Docker images for frontend & backend
- Starts all services with docker-compose
- Configures Nginx for routing

**Manage containers:**
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

---

### ☁️ Option 3: AWS Amplify + EC2
**Time**: 45-60 minutes  
**Cost**: ~$15-35/month  
**Best for**: Production with auto-scaling frontend

#### Part A: Backend on EC2
Follow Option 1, but only for backend:
```bash
# Deploy only backend
./deploy-ec2.sh
# Then note your EC2 public IP or domain
```

#### Part B: Frontend on Amplify
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New App" → "Host web app"
3. Connect to GitHub repository
4. Configure build settings:
   - Framework: Next.js
   - Root directory: `nextjs-app`
   - Build command: `npm run build`
   - Start command: `npm start`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `http://your-ec2-ip:5000` or `https://api.yourdomain.com`
6. Deploy

---

### 🏢 Option 4: AWS ECS/Fargate (Advanced)
**Time**: 1-2 hours  
**Cost**: ~$30-50/month  
**Best for**: High availability, auto-scaling

```bash
# 1. Update script
nano deploy-ecs.sh
# Edit: AWS_REGION, AWS_ACCOUNT_ID

# 2. Setup environment
cp .env.example .env
nano .env

# 3. Push images to ECR
./deploy-ecs.sh

# 4. Complete setup in AWS Console
# See AWS_DEPLOYMENT_GUIDE.md for details
```

---

## Pre-Deployment Checklist

### ✅ Required
- [ ] AWS account (for AWS deployments)
- [ ] Supabase project created
- [ ] Supabase credentials ready
- [ ] JWT secret generated (32+ characters)

### ✅ Recommended
- [ ] Domain name purchased
- [ ] SSL certificate (Let's Encrypt is free)
- [ ] GitHub repository access

### ✅ Optional
- [ ] CloudFlare for CDN/DDoS protection
- [ ] AWS CloudWatch for monitoring
- [ ] Backup strategy

---

## Quick Commands

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Check if services are running (EC2)
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip "pm2 status"
```

### View logs (EC2)
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip "pm2 logs gem-bot-backend --lines 100"
```

### Restart services (EC2)
```bash
ssh -i your-ec2-ip "pm2 restart all"
```

### Update application (EC2)
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip << 'EOF'
cd ~/gem-agent
git pull origin main
cd nextjs-app/server
npm install && npm run build
pm2 restart gem-bot-backend
cd ..
npm install && npm run build
pm2 restart gem-bot-frontend
EOF
```

---

## Environment Variables Reference

```bash
# Backend (.env in server/)
NODE_ENV=production
PORT=5000
JWT_SECRET=your-32-char-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Cost Breakdown

### EC2 t3.micro (Option 1 & 3)
- Instance: $7-10/month
- Data transfer: $3-5/month
- Storage: $1-2/month
- **Total: $11-17/month**

### Amplify (Option 3 frontend)
- Build time: $0.01/min
- Hosting: $0.15/GB served
- **Estimate: $5-15/month** (depends on traffic)

### Docker on VPS (Option 2)
- Depends on provider (DigitalOcean, Linode, etc.)
- **Estimate: $10-20/month**

### ECS Fargate (Option 4)
- vCPU: $0.04048/hour
- Memory: $0.004445/GB-hour
- **Estimate: $30-50/month**

---

## Troubleshooting

### Backend not accessible
```bash
# Check if service is running
pm2 status

# Check logs
pm2 logs gem-bot-backend

# Restart
pm2 restart gem-bot-backend
```

### Frontend not loading
```bash
# Check Next.js process
pm2 status

# Verify environment variable
pm2 env gem-bot-frontend | grep API_URL

# Restart
pm2 restart gem-bot-frontend
```

### Database connection issues
- Verify Supabase credentials
- Check if IP is whitelisted in Supabase
- Test connection: `curl https://your-project.supabase.co`

### CORS errors
- Update `FRONTEND_URL` in backend `.env`
- Restart backend: `pm2 restart gem-bot-backend`

---

## Need Help?

1. Check logs first: `pm2 logs`
2. Review [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
3. Verify all environment variables
4. Check security groups (AWS)
5. Verify firewall rules

## Next Steps After Deployment

1. ✅ Test all functionality
2. ✅ Setup SSL certificate (Let's Encrypt)
3. ✅ Configure domain name
4. ✅ Setup monitoring (CloudWatch)
5. ✅ Create backup strategy
6. ✅ Configure auto-scaling (if needed)
7. ✅ Setup CI/CD pipeline
8. ✅ Load testing
9. ✅ Security audit
10. ✅ Documentation for team
