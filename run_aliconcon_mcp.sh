#!/bin/bash

# Aliconcon MCP System Startup Script
# This script starts both the MCP server and the OpenRouter + DeepSeek R1 client
# Following OpenRouter MCP documentation: https://openrouter.ai/docs/use-cases/mcp-servers

set -e

echo "🚀 Starting Aliconcon MCP System with WebSocket Support"
echo "======================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "server-mcp" ] || [ ! -d "client-mcp" ]; then
    print_error "Please run this script from the project root directory (do-an-1-v2)"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install it first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first:"
    echo "https://nodejs.org/"
    exit 1
fi

print_success "Prerequisites check passed"

# Check OpenRouter API configuration
print_status "Checking OpenRouter API configuration..."

if [ -z "$OPENROUTER_API_KEY" ]; then
    print_error "OPENROUTER_API_KEY is not set!"
    echo ""
    echo "🔑 Để sử dụng AI models MIỄN PHÍ qua OpenRouter + MCP:"
    echo ""
    echo "1. 🌐 Truy cập: https://openrouter.ai"
    echo "2. 📝 Đăng ký tài khoản MIỄN PHÍ"
    echo "3. 🔑 Vào Dashboard → Keys → Create Key"
    echo "4. 📋 Copy API key và chạy lệnh:"
    echo "   export OPENROUTER_API_KEY='your_api_key_here'"
    echo "5. 🚀 Chạy lại script này"
    echo ""
    echo "📖 Tham khảo: https://openrouter.ai/docs/use-cases/mcp-servers"
    echo ""
    print_warning "Không thể tiếp tục mà không có API key!"
    exit 1
else
    print_success "OpenRouter API key is configured"
    # Mask the API key for security
    masked_key="${OPENROUTER_API_KEY:0:8}...${OPENROUTER_API_KEY: -4}"
    echo "   Key: $masked_key"
fi

echo ""

# Check if MCP server is running
print_status "Checking MCP server status..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "MCP server is already running"
else
    print_warning "MCP server not running, starting it..."
    
    # Start MCP server in background
    cd server-mcp
    print_status "Starting MCP server on port 8000..."
    bun run server.ts &
    MCP_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 3
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "MCP server started successfully (PID: $MCP_PID)"
    else
        print_error "Failed to start MCP server"
        exit 1
    fi
fi

echo ""

# Start MCP client with WebSocket support
print_status "Starting MCP client with WebSocket server..."
cd client-mcp

echo ""
echo "🌐 System URLs:"
echo "   • MCP Server: http://localhost:8000"
echo "   • WebSocket Server: ws://localhost:8001/chat (HTTP)"
echo "   • Secure WebSocket: wss://localhost:8001/chat (HTTPS - set USE_HTTPS=true)"
echo "   • Health Check: http://localhost:8000/health"
echo ""
echo "🔧 Available Tools:"
echo "   • introduce: Company information"
echo "   • popular-products: Product listings"
echo ""
echo "💬 Chat Interfaces:"
echo "   • Console: Interactive terminal chat"
echo "   • WebSocket: Real-time web chat (for client-customer)"
echo ""
echo "🛍️ Client Integration:"
echo "   • Add AIChatBot component to client-customer"
echo "   • Set NEXT_PUBLIC_WS_URL=wss://localhost:8001/chat (for secure)"
echo "   • Set NEXT_PUBLIC_WS_URL=ws://localhost:8001/chat (for development)"
echo "   • Supports markdown rendering and real-time chat"
echo ""
echo "🔒 Security Options:"
echo "   • Set USE_HTTPS=true for WSS (secure WebSocket)"
echo "   • Auto-generates self-signed certificates for development"
echo "   • Place custom certificates in ./certificates/ directory"
echo ""

print_success "Starting Aliconcon MCP Client..."
bun run index.ts

# Cleanup will be called automatically on script exit 