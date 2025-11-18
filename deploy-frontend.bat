@echo off
echo Building Campus Share Frontend for Production...

cd frontend

echo Setting production environment variables...
set VITE_API_URL=https://campus-share.onrender.com
set VITE_SOCKET_URL=https://campus-share.onrender.com
set NODE_ENV=production

echo Installing dependencies...
npm ci

echo Building frontend...
npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Build completed successfully!
echo Files are in frontend/dist directory

echo.
echo Frontend built with:
echo - VITE_API_URL=https://campus-share.onrender.com
echo - VITE_SOCKET_URL=https://campus-share.onrender.com
echo.

pause