#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting PM2 deployment for do-an-1-server...${NC}"

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found globally. Installing PM2...${NC}"
    npm install -g pm2
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2 installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install PM2${NC}"
        exit 1
    fi
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Stop existing PM2 process if running
echo -e "${BLUE}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop do-an-1-server 2>/dev/null || echo -e "${YELLOW}⚠️  No existing process to stop${NC}"
pm2 delete do-an-1-server 2>/dev/null || echo -e "${YELLOW}⚠️  No existing process to delete${NC}"

# Start the application with PM2
echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application started successfully${NC}"
    
    # Save PM2 configuration
    echo -e "${BLUE}💾 Saving PM2 configuration...${NC}"
    pm2 save
    
    # Setup PM2 startup script
    echo -e "${BLUE}🔧 Setting up PM2 startup script...${NC}"
    pm2 startup
    
    # Show status
    echo -e "${BLUE}📊 Current PM2 status:${NC}"
    pm2 status
    
    # Show logs
    echo -e "${BLUE}📝 Recent logs:${NC}"
    pm2 logs do-an-1-server --lines 10
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📋 Useful commands:${NC}"
    echo -e "  ${YELLOW}npm run pm2:status${NC}   - Check application status"
    echo -e "  ${YELLOW}npm run pm2:logs${NC}     - View application logs"
    echo -e "  ${YELLOW}npm run pm2:restart${NC}  - Restart application"
    echo -e "  ${YELLOW}npm run pm2:stop${NC}     - Stop application"
    echo -e "  ${YELLOW}npm run pm2:monit${NC}    - Monitor application"
    
else
    echo -e "${RED}❌ Failed to start application${NC}"
    exit 1
fi 