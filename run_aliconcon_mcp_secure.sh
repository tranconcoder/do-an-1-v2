#!/bin/bash

# Aliconcon MCP Secure Setup Script
# Khởi chạy hệ thống với WSS (WebSocket Secure) + Redis Memory

echo "🚀 Starting Aliconcon MCP Secure System..."
echo "🔒 WSS (WebSocket Secure) + Redis Memory + MCP Tools"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if OpenRouter API key is set
if [ -z "$OPENROUTER_API_KEY" ]; then
    print_error "OPENROUTER_API_KEY is not set!"
    echo "Please set your OpenRouter API key:"
    echo "export OPENROUTER_API_KEY='your_api_key_here'"
    echo ""
    echo "Get your FREE API key at: https://openrouter.ai"
    exit 1
fi

print_status "OpenRouter API key found ✓"

# Set environment variables for WSS + Redis
export USE_WSS=true
export WEBSOCKET_PORT=8001
export REDIS_URL=redis://localhost:6379
export MCP_URL=http://localhost:8000
export LLM_MODEL=${LLM_MODEL:-"qwen/qwen3-30b-a3b:free"}
export DISABLE_THINKING=${DISABLE_THINKING:-"true"}

print_status "Environment configured for WSS + Redis"

# Step 1: Start Redis with Docker
print_step "1. Starting Redis with Docker..."
docker run -d --name redis-aliconcon -p 6379:6379 redis:alpine 2>/dev/null || {
    print_warning "Redis container already exists or failed to start"
    docker start redis-aliconcon 2>/dev/null || print_warning "Could not start existing Redis container"
}

# Wait for Redis to be ready
sleep 2
print_status "Redis container started"

# Step 2: Start MCP Server
print_step "2. Starting MCP Server..."
cd server-mcp
echo "Starting MCP server with WebSocket support..."
bun run server.ts &
MCP_PID=$!
cd ..

# Wait for MCP server to start
sleep 3
print_status "MCP Server started (PID: $MCP_PID)"

# Step 3: Start Client-MCP with WSS + Redis
print_step "3. Starting Client-MCP with WSS + Redis Memory..."
cd client-mcp

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    bun install
fi

print_status "Starting WSS client with Redis memory..."
echo ""
echo "🔒 WSS Configuration:"
echo "   - WebSocket Secure: wss://localhost:8001/chat"
echo "   - SSL Certificates: Auto-generated"
echo "   - Redis Memory: Enabled"
echo "   - Model: $LLM_MODEL"
echo ""
echo "🌐 Connection URLs:"
echo "   - Local: wss://localhost:8001/chat"
echo "   - Tailscale: wss://aliconcon.tail61bbbd.ts.net:8001/chat"
echo ""

# Start the client
bun run index.ts

# Cleanup function
cleanup() {
    print_step "Cleaning up..."
    
    # Kill MCP server
    if [ ! -z "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null
        print_status "MCP Server stopped"
    fi
    
    # Stop Redis container
    docker stop redis-aliconcon 2>/dev/null
    docker rm redis-aliconcon 2>/dev/null
    print_status "Redis container stopped"
    
    print_status "Cleanup completed"
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup EXIT INT TERM

# Keep script running
wait 