#!/bin/bash

echo "🚀 GEM Bid Management System - Development Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd server

if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from .env.example"
    cp .env.example .env
    echo "📝 Please edit server/.env with your Supabase credentials before continuing."
    read -p "Press enter when ready..."
fi

echo "📥 Installing backend dependencies..."
npm install

echo ""
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."

if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local file"
    cp .env.local.example .env.local
fi

echo "📥 Installing frontend dependencies..."
npm install

echo ""
echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Backend: http://localhost:5000"
echo "📌 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
