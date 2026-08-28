# Kedar AI Dedicated Model Server Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ⚡ Starting Kedar AI Dedicated Model Server (kedar-ai-pro-v1)..." -ForegroundColor Yellow
Write-Host "  Port:     8000" -ForegroundColor Green
Write-Host "  Endpoint: http://localhost:8000/v1/chat/completions" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

python kedar_model/server.py
