FROM node:18-alpine

# Install necessary build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps || npm install --force

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs public

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
