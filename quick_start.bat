@echo off
echo 🚀 TourMyHoliday - Quick Start Script
echo =====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

echo ✅ All dependencies installed successfully

REM Start backend server
echo 🔧 Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm start"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo 🎉 TourMyHoliday is starting up!
echo =================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo.
echo Both servers are now running in separate windows.
echo Close the windows to stop the servers.
pause 