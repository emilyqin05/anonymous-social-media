#!/bin/bash

# Start development servers for anonymous social media app
# This script starts both the backend (Node.js/Express) and frontend (Next.js)

echo "🚀 Starting Anonymous Social Media Development Servers..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "📡 Starting backend server (Node.js/Express + SQLite)..."
cd server
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server (Next.js)..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers are starting up!"
echo "📡 Backend API: http://localhost:3001"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
