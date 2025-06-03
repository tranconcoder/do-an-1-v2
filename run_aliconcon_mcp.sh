#!/bin/bash

# Aliconcon MCP System Startup Script
# This script starts both the MCP server and the OpenRouter + DeepSeek R1 client
# Following OpenRouter MCP documentation: https://openrouter.ai/docs/use-cases/mcp-servers

set -e

echo "🚀 Starting Aliconcon MCP System with OpenRouter + DeepSeek R1..."
echo "================================================================="

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
    print_warning "OPENROUTER_API_KEY is not set!"
    echo ""
    echo "To use DeepSeek R1 MIỄN PHÍ qua OpenRouter + MCP, you need to:"
    echo "1. Visit https://openrouter.ai"
    echo "2. Sign up for a FREE account"
    echo "3. Get your API key from dashboard"
    echo "4. Set the environment variable:"
    echo "   export OPENROUTER_API_KEY='your_api_key_here'"
    echo ""
    echo "📖 Reference: https://openrouter.ai/docs/use-cases/mcp-servers"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "OpenRouter API key is configured"
fi

# Set default environment variables if not set
export LLM_MODEL="${LLM_MODEL:-deepseek/deepseek-chat:free}"
export LLM_TEMPERATURE="${LLM_TEMPERATURE:-0.7}"
export DISABLE_THINKING="${DISABLE_THINKING:-true}"
export MCP_PORT="${MCP_PORT:-8000}"
export MCP_URL="${MCP_URL:-http://localhost:8000}"

print_status "Configuration:"
echo "  - Model: $LLM_MODEL (MIỄN PHÍ qua OpenRouter)"
echo "  - Temperature: $LLM_TEMPERATURE"
echo "  - Disable Thinking: $DISABLE_THINKING"
echo "  - MCP Port: $MCP_PORT"
echo "  - Architecture: OpenRouter → MCP Server → Tools"

# Install dependencies
print_status "Installing dependencies..."

# Install server dependencies
if [ -f "server-mcp/package.json" ]; then
    print_status "Installing MCP server dependencies..."
    cd server-mcp
    bun install
    cd ..
    print_success "MCP server dependencies installed"
fi

# Install client dependencies
if [ -f "client-mcp/package.json" ]; then
    print_status "Installing MCP client dependencies..."
    cd client-mcp
    bun install
    cd ..
    print_success "MCP client dependencies installed"
fi

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down services..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        print_status "MCP server stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start MCP server in background
print_status "Starting MCP server on port $MCP_PORT..."
cd server-mcp
bun run server.ts &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "MCP server started successfully (PID: $SERVER_PID)"
else
    print_error "Failed to start MCP server"
    exit 1
fi

# Test server connectivity
print_status "Testing MCP server connectivity..."
if curl -s "http://localhost:$MCP_PORT/health" > /dev/null; then
    print_success "MCP server is responding"
else
    print_warning "MCP server health check failed, but continuing..."
fi

# Start client
print_status "Starting DeepSeek R1 client..."
echo ""
echo "🤖 DeepSeek R1 Configuration:"
echo "   - Thinking traces: $([ "$DISABLE_THINKING" = "true" ] && echo "DISABLED" || echo "ENABLED")"
echo "   - Model: $LLM_MODEL"
echo "   - Temperature: $LLM_TEMPERATURE"
echo ""
echo "💡 To toggle thinking traces, set DISABLE_THINKING=false and restart"
echo ""

cd client-mcp
bun run index.ts

# Cleanup will be called automatically on script exit 