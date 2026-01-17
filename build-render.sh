#!/bin/bash
# Build script for Render deployment
# This script runs automatically when deploying to Render

set -e  # Exit on error

echo "=== DevApply Build Script ==="
echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Build React frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Initialize database (if needed)
echo "Database will be initialized on first run..."

echo "=== Build Complete ==="
echo "Application is ready for deployment!"
