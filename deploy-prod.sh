#!/bin/bash

# Campus Share Production Deployment Script
# This script handles production deployment with proper error handling

set -e  # Exit on error

echo "🚀 Starting Campus Share deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
  echo "❌ Error: render.yaml not found. Please run this script from the project root."
  exit 1
fi

echo "📋 Pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✓ Node.js version: $NODE_VERSION"

# Check npm version  
NPM_VERSION=$(npm --version)
echo "✓ npm version: $NPM_VERSION"

# Frontend checks
echo "🎨 Preparing frontend..."
cd frontend

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.vite

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci

# Build frontend
echo "🔨 Building frontend..."
NODE_ENV=production npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi

echo "✓ Frontend build completed successfully"

# Backend checks
echo "🔧 Preparing backend..."
cd ../backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --only=production

# Test backend
echo "🧪 Testing backend configuration..."
node -e "
try {
  require('./index.js');
  console.log('✓ Backend configuration is valid');
} catch (error) {
  console.error('❌ Backend configuration error:', error.message);
  process.exit(1);
}
"

cd ..

echo "✅ All pre-deployment checks passed!"
echo "📤 Ready for deployment to Render"
echo ""
echo "Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Production deployment'"
echo "2. Push to main branch: git push origin main"
echo "3. Render will automatically deploy your changes"
echo ""
echo "📊 Monitor deployment at:"
echo "   Frontend: https://dashboard.render.com/static/srv-xxx"
echo "   Backend:  https://dashboard.render.com/web/srv-xxx"