@echo off
echo ============================================
echo Installing Phase 3 Dependencies
echo ============================================
echo.

cd server

echo Installing multer for file upload handling...
call npm install multer

echo.
echo Installing express-rate-limit for rate limiting...
call npm install express-rate-limit

echo.
echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo New packages installed:
echo - multer (file upload)
echo - express-rate-limit (rate limiting)
echo.
echo You can now start the server with: npm start
echo.
pause
