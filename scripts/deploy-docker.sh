#!/bin/bash

# Docker Deployment Script
# This script builds and runs the application using Docker Compose

set -e

echo "🐳 Starting Docker Deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and fill in your values"
    exit 1
fi

echo -e "${BLUE}Building Docker images...${NC}"
docker compose build

echo -e "${GREEN}✓ Images built${NC}"

echo -e "${BLUE}Starting containers...${NC}"
docker compose up -d

echo -e "${GREEN}✓ Containers started${NC}"

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 10

# Check container status
echo -e "${BLUE}Container status:${NC}"
docker compose ps

# Display logs
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:  ${BLUE}http://localhost:5000${NC}"
echo ""
echo -e "To view logs:"
echo -e "  ${BLUE}docker compose logs -f${NC}"
echo ""
echo -e "To stop:"
echo -e "  ${BLUE}docker compose down${NC}"
echo ""
