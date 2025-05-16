#!/bin/bash

# Exit on error
set -e

# Display an informative message
echo "Starting all development servers..."

# Define the base directory
BASE_DIR="$(pwd)"

# Function to start a server in a new terminal
start_server() {
    local dir="$1"
    local cmd="$2"
    local title="$3"
    
    # Open a new terminal window with the specified command
    gnome-terminal --tab --title="$title" -- bash -c "cd '$BASE_DIR/$dir' && $cmd; exec bash"
}

# Start all servers
start_server "client-admin" "npm start" "Client Admin"
start_server "client-shop" "npm start" "Client Shop"
start_server "client-v2" "npm start" "Client V2"
start_server "server" "npm run dev" "Server"

echo "All development servers have been started."
echo "• Client Admin: http://localhost:3000"
echo "• Client Shop: http://localhost:3000 (will prompt for port change)"
echo "• Client V2: http://localhost:3000 (will prompt for port change)"
echo "• Server: Check terminal for port info" 