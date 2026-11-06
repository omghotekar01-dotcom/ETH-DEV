@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js 22 or later is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
echo.
echo ----------------------------------------
echo     RIFT - AGENT SPENDING FIREWALL
echo       LOCAL TRAINING SANDBOX ONLY
echo ----------------------------------------
echo.
echo Open this URL in your browser: http://localhost:3000
echo No wallet, API keys or npm install required.
echo Press Ctrl+C to stop the server.
echo.
node server\index.mjs
if errorlevel 1 (
  echo.
  echo RIFT failed to launch. Try npm run check to diagnose.
  pause
  exit /b 1
)
