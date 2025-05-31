# HTTPS Setup Guide for Client-Customer Application (Bun)

This guide explains how to set up HTTPS for the Next.js client-customer application using Bun in both development and production environments.

## Quick Start

### 1. Generate SSL Certificates (Development)

```bash
# Make the script executable
chmod +x generate-certificates.sh

# Generate self-signed certificates
bun run generate-certs
```

### 2. Development with HTTPS

```bash
# Start development server with HTTPS
bun run dev
# or
bun run start:dev
```

### 3. Production with HTTPS

```bash
# Build the application
bun run build

# Start production server with HTTPS
bun run start:https
```

## Configuration Details

### Next.js Configuration (`next.config.mjs`)

The configuration includes:

-   Security headers for production
-   SSL certificate handling via custom server
-   Compatible with Next.js 15.2.4

### Custom Server (`server.js`)

-   Handles HTTPS in production using custom SSL certificates
-   Supports both HTTP (development) and HTTPS (production)
-   Runs with Bun runtime for better performance
-   Proper error handling and logging

### Package.json Scripts (Bun)

-   `dev`: Development with HTTPS and Turbo
-   `build`: Build the application
-   `start`: Production HTTPS server with Bun
-   `start:https`: Explicit HTTPS production server with Bun
-   `start:dev`: Development HTTPS server
-   `generate-certs`: Generate SSL certificates

## SSL Certificate Options

### Option 1: Self-Signed Certificates (Development/Testing)

```bash
bun run generate-certs
```

### Option 2: Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to your app
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./certificates/private-key.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certificates/certificate.pem
```

### Option 3: Commercial SSL Certificate

1. Purchase SSL certificate from a trusted CA
2. Place the private key as `certificates/private-key.pem`
3. Place the certificate as `certificates/certificate.pem`

## Environment Variables

Create a `.env.local` file:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=localhost
HTTPS_ENABLED=true
NEXT_PUBLIC_API_URL=https://localhost:4000
NEXT_PUBLIC_CLIENT_URL=https://localhost:3000
NEXT_PUBLIC_VNPAY_RETURN_URL=https://localhost:3000/payment/vnpay-return
```

## Bun-Specific Features

### Performance Benefits

-   Faster startup times with Bun runtime
-   Better memory usage
-   Native TypeScript support
-   Faster package installation

### Running with Bun

```bash
# Install dependencies
bun install

# Development
bun run dev

# Production build
bun run build

# Production start with HTTPS
bun run start:https
```

## Docker Deployment

### Build Docker Image (Bun)

```bash
docker build -t client-customer-https-bun .
```

### Updated Dockerfile for Bun

```dockerfile
# Use Bun runtime
FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./
COPY --from=builder /app/certificates ./certificates

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "server.js"]
```

## Security Features

### Security Headers

The application includes these security headers:

-   `Strict-Transport-Security`: Forces HTTPS
-   `X-Frame-Options`: Prevents clickjacking
-   `X-Content-Type-Options`: Prevents MIME sniffing
-   `Referrer-Policy`: Controls referrer information

### HTTPS Enforcement

-   Development: Uses Next.js experimental HTTPS
-   Production: Custom HTTPS server with SSL certificates
-   Bun runtime for enhanced performance

## Troubleshooting

### Next.js 15.2.4 Compatibility

-   Removed deprecated `experimental.https` configuration
-   Uses custom server for HTTPS in production
-   Security headers configured via `headers()` function

### Certificate Issues

1. **Certificate not found**: Ensure certificates exist in `certificates/` directory
2. **Permission denied**: Check file permissions on certificate files
3. **Invalid certificate**: Regenerate certificates or check CA chain

### Browser Warnings

For self-signed certificates:

1. Click "Advanced" in browser warning
2. Click "Proceed to localhost (unsafe)"
3. Or add certificate to browser's trusted certificates

### Port Conflicts

If port 3000 is in use:

```bash
PORT=3001 bun run start:https
```

## Production Deployment

### PM2 with Bun

```bash
# Install PM2
bun add -g pm2

# Start with PM2
pm2 start server.js --name "client-customer-https" --interpreter bun

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;

    location / {
        proxy_pass https://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Integration with Payment Service

The HTTPS setup is configured to work with your VNPay payment service:

-   Return URL: `https://localhost:3000/payment/vnpay-return`
-   Secure communication with backend API
-   SSL certificate validation

## Notes

-   Self-signed certificates will show browser warnings
-   For production, use certificates from a trusted CA
-   Ensure your backend API also supports HTTPS
-   Update VNPay configuration with HTTPS URLs
-   Bun provides better performance than Node.js for this setup
