# ========================================================
# Chess Arena — Production Docker Deployment Script (PowerShell)
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      ♟️  CHESS ARENA — PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check if Docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed or not in system PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Load environment
if (Test-Path ".env.docker") {
    Write-Host "📄 Loading environment variables from .env.docker..." -ForegroundColor Green
    Get-Content ".env.docker" | Where-Object { $_ -match '=' -and -not $_.StartsWith('#') } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim())
    }
}

Write-Host "🔨 Building multi-stage container images..." -ForegroundColor Yellow
docker compose build

Write-Host "🚀 Starting containerized services (postgres, backend, frontend)..." -ForegroundColor Yellow
docker compose up -d

Write-Host "⏳ Awaiting service health verification..." -ForegroundColor Yellow
$maxRetries = 30
$count = 0
$healthy = $false

while ($count -lt $maxRetries) {
    try {
        $status = docker inspect --format='{{json .State.Health.Status}}' chess-arena-backend 2>$null
        if ($status -eq '"healthy"') {
            $healthy = $true
            break
        }
    } catch {}
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 3
    $count++
}

Write-Host ""

if ($healthy) {
    Write-Host "✅ All containers are healthy and operational!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
    docker compose ps
    Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "🎉 Chess Arena is now live!" -ForegroundColor Green
    Write-Host "🌐 Frontend Client: http://localhost (or port 80 / 5173)" -ForegroundColor White
    Write-Host "🔌 Backend REST:    http://localhost:8080/api/health" -ForegroundColor White
    Write-Host "📊 PostgreSQL:      localhost:5432" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Backend healthcheck timed out. Reviewing logs:" -ForegroundColor Red
    docker compose logs --tail=50 backend
    exit 1
}
