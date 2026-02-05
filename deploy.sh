#!/bin/bash

set -euo pipefail

echo "🚀 Starting deployment..."

# Configuration
HOST_PORT="${HOST_PORT:-8080}"

echo "🛑 Stopping old containers..."
docker-compose down || true

echo "📦 Building and starting containers..."
docker-compose up -d --build

echo "⏳ Waiting for container to start..."
sleep 10

echo "🔍 Running health check..."
if curl -f -s "http://localhost:$HOST_PORT/health" > /dev/null; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check failed"
  echo "Container logs:"
  docker-compose logs --tail 30
  exit 1
fi

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
docker-compose ps
