#!/bin/bash

# Install backend dependencies
pip install -r requirements.txt

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Run migrations if needed
python -m app.db

echo "Build completed successfully!"
