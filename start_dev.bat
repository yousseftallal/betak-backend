@echo off
echo ==========================================
echo    Starting BeTak Social App System
echo ==========================================

echo [1/2] Starting Backend Server (Port 3000)...
start "BeTak Backend" cmd /k "npm run dev"

echo [2/2] Starting Frontend Client (Port 5173)...
start "BeTak Admin Dashboard" cmd /k "cd client && npm run dev -- --force"

echo.
echo ==========================================
echo    System Running!
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5173
echo ==========================================
echo.
pause
