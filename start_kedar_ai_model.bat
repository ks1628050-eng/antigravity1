@echo off
title Kedar AI Dedicated Model Server (kedar-ai-pro-v1)
echo ============================================================
echo   ⚡ Starting Kedar AI Dedicated Model Server...
echo   Port: 8000
echo   Endpoint: http://localhost:8000/v1/chat/completions
echo ============================================================
python kedar_model/server.py
pause
