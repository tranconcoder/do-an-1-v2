# Use Bun runtime as the base image
FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN bun run build

# Production image, copy all the files and run with Bun
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./
COPY --from=builder /app/certificates ./certificates

# Create certificates directory and set permissions
RUN mkdir -p ./certificates && chown nextjs:bunjs ./certificates

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application with HTTPS using Bun
CMD ["bun", "server.js"] 