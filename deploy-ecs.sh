#!/bin/bash

# AWS ECS Deployment Script
# This script deploys the application to AWS ECS using Fargate

set -e

echo "☁️ Starting AWS ECS Deployment..."

# Variables - UPDATE THESE
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="your-aws-account-id"
CLUSTER_NAME="gem-bot-cluster"
SERVICE_NAME_BACKEND="gem-bot-backend"
SERVICE_NAME_FRONTEND="gem-bot-frontend"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Login to ECR
echo -e "${BLUE}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repositories if they don't exist
echo -e "${BLUE}Creating ECR repositories...${NC}"
aws ecr create-repository --repository-name gem-bot-backend --region $AWS_REGION 2>/dev/null || true
aws ecr create-repository --repository-name gem-bot-frontend --region $AWS_REGION 2>/dev/null || true

# Build and push backend
echo -e "${BLUE}Building and pushing backend image...${NC}"
cd server
docker build -t gem-bot-backend .
docker tag gem-bot-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/gem-bot-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/gem-bot-backend:latest
cd ..

# Build and push frontend
echo -e "${BLUE}Building and pushing frontend image...${NC}"
docker build -t gem-bot-frontend .
docker tag gem-bot-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/gem-bot-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/gem-bot-frontend:latest

echo -e "${GREEN}✓ Images pushed to ECR${NC}"

# Create ECS cluster if it doesn't exist
echo -e "${BLUE}Creating ECS cluster...${NC}"
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || true

echo -e "${GREEN}✓ ECS cluster ready${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Images Pushed to ECR!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Go to AWS ECS Console"
echo "2. Create task definitions for backend and frontend"
echo "3. Create ECS services using the task definitions"
echo "4. Configure Application Load Balancer"
echo "5. Update Route53 or domain settings"
echo ""
echo "See AWS_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
