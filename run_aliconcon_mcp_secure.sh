#!/bin/bash

# Aliconcon MCP System Startup Script - SECURE VERSION (WSS)
# This script starts the MCP system with WSS (WebSocket Secure) enabled

echo "🔒 Starting Aliconcon MCP System with WSS (Secure WebSocket)"
echo "============================================================"

# Enable HTTPS/WSS
export USE_HTTPS=true

# Set secure WebSocket URL for client
export NEXT_PUBLIC_WS_URL=wss://localhost:8001/chat

echo "🔒 Security Settings:"
echo "   • USE_HTTPS=true (WSS enabled)"
echo "   • NEXT_PUBLIC_WS_URL=wss://localhost:8001/chat"
echo ""

# Run the main startup script
./run_aliconcon_mcp.sh 