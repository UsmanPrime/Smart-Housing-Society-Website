@echo off
echo ========================================
echo  Starting Smart Housing Society Servers
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd server && npm start"

timeout /t 3

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close the opened terminal windows to stop the servers.
echo.
pause
