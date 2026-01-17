# Multi-stage build for React Vite frontend
# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
