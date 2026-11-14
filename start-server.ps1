param([string]$DbUri = "")

if (-not $env:DATABASE_URL) {
    if (-not $DbUri) { Write-Error "DATABASE_URL not set and no -DbUri supplied. Load .env first."; exit 1 }
    $env:DATABASE_URL = $DbUri
}
if (-not $env:ADMIN_PASSWORD)      { Write-Error "ADMIN_PASSWORD not set. Load .env first."; exit 1 }
if (-not $env:SECRET_KEY)          { Write-Error "SECRET_KEY not set. Load .env first."; exit 1 }
if (-not $env:WORKER_BEARER_TOKEN) { Write-Error "WORKER_BEARER_TOKEN not set. Load .env first."; exit 1 }

Set-Location "C:\Users\miao\Projects\LingKoiTech\protostar\protostar_server"

Write-Host "=== alembic upgrade head ==="
uv run --group dev alembic upgrade head
if ($LASTEXITCODE -ne 0) { Write-Error "alembic failed"; exit 1 }

Write-Host "=== seed ==="
uv run python -m app.seed
if ($LASTEXITCODE -ne 0) { Write-Error "seed failed"; exit 1 }

Write-Host "=== uvicorn ==="
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
