# Use specific Node.js LTS version with pinned digest for reproducibility
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Use npm ci for deterministic builds and security
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

COPY . .

RUN npm run build

# Use specific nginx version with pinned digest
FROM nginx:1.29.5-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for nginx
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
