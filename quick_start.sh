#!/bin/bash

echo "🚀 TourMyHoliday - Quick Start Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

echo "✅ All dependencies installed successfully"

# Start backend server
echo "🔧 Starting backend server..."
cd ../backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 TourMyHoliday is starting up!"
echo "================================="
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Admin Panel: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait 