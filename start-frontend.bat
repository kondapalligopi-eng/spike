@echo off
echo ================================================
echo   Pet Dogs - Starting Frontend (Mock Mode)
echo ================================================
echo.

cd /d "%~dp0frontend"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    npm install
    echo.
)

echo Starting the app in MOCK MODE (no backend needed)...
echo.
echo Once started, open your browser at: http://localhost:5173
echo Press Ctrl+C to stop.
echo.

npm run dev
pause
