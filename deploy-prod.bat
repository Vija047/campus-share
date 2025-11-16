@echo off
REM Campus Share Production Deployment Script for Windows
REM This script handles production deployment with proper error handling

setlocal enabledelayedexpansion

echo 🚀 Starting Campus Share deployment...

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please run this script from the project root.
    exit /b 1
)

echo 📋 Pre-deployment checks...

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%

REM Check npm version  
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm version: %NPM_VERSION%

REM Frontend checks
echo 🎨 Preparing frontend...
cd frontend

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm ci
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed!
    exit /b 1
)

REM Build frontend
echo 🔨 Building frontend...
set NODE_ENV=production
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    exit /b 1
)

REM Check if build was successful
if not exist "dist" (
    echo ❌ Frontend build failed - no dist directory created!
    exit /b 1
)

echo ✓ Frontend build completed successfully

REM Backend checks
echo 🔧 Preparing backend...
cd ..\backend

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm ci --only=production
if errorlevel 1 (
    echo ❌ Backend dependency installation failed!
    exit /b 1
)

cd ..

echo ✅ All pre-deployment checks passed!
echo 📤 Ready for deployment to Render
echo.
echo Next steps:
echo 1. Commit your changes: git add . ^&^& git commit -m "Production deployment"
echo 2. Push to main branch: git push origin main
echo 3. Render will automatically deploy your changes
echo.
echo 📊 Monitor deployment at:
echo    Frontend: https://dashboard.render.com/static/srv-xxx
echo    Backend:  https://dashboard.render.com/web/srv-xxx

pause