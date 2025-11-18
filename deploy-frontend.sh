#!/bin/bash

echo "Building Campus Share Frontend for Production..."

cd frontend

echo "Setting production environment variables..."
export VITE_API_URL=https://campus-share.onrender.com
export VITE_SOCKET_URL=https://campus-share.onrender.com
export NODE_ENV=production

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Build completed successfully!"
echo "Files are in frontend/dist directory"

echo ""
echo "Frontend built with:"
echo "- VITE_API_URL=https://campus-share.onrender.com"
echo "- VITE_SOCKET_URL=https://campus-share.onrender.com"
echo ""