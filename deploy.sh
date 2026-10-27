#!/usr/bin/env bash
set -e

# ========================================================
# Chess Arena — Production Docker Deployment Script (Bash)
# ========================================================

echo "========================================================"
echo "      ♟️  CHESS ARENA — PRODUCTION DEPLOYMENT"
echo "========================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Load environment file
if [ -f .env.docker ]; then
    echo "📄 Loading environment from .env.docker..."
    export $(grep -v '^#' .env.docker | xargs)
elif [ -f .env ]; then
    echo "📄 Loading environment from .env..."
    export $(grep -v '^#' .env | xargs)
fi

echo "🔨 Building multi-stage container images..."
docker compose build --parallel

echo "🚀 Launching containerized services (postgres, backend, frontend)..."
docker compose up -d

echo "⏳ Waiting for services to become healthy..."
MAX_RETRIES=30
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    BACKEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' chess-arena-backend 2>/dev/null || echo "starting")
    if [ "$BACKEND_STATUS" = "\"healthy\"" ]; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep 3
    COUNT=$((COUNT + 1))
done

echo ""

if [ "$HEALTHY" = true ]; then
    echo "✅ All containers are healthy and operational!"
    echo "--------------------------------------------------------"
    docker compose ps
    echo "--------------------------------------------------------"
    echo "🎉 Chess Arena is now live!"
    echo "🌐 Frontend Client: http://localhost (or port 80 / 5173)"
    echo "🔌 Backend REST:    http://localhost:8080/api/health"
    echo "📊 PostgreSQL:      localhost:5432"
    echo "========================================================"
else
    echo "⚠️ Warning: Backend healthcheck timed out. Checking logs..."
    docker compose logs --tail=50 backend
    exit 1
fi
