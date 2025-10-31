@echo off
echo ========================================
echo  Smart Housing Society - Server Setup
echo ========================================
echo.

cd server

echo Installing backend dependencies...
call npm install

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo IMPORTANT: Before starting the server, please:
echo 1. Open server/.env file
echo 2. Replace EMAIL_USER with your Gmail address
echo 3. Replace EMAIL_PASS with your Gmail App Password
echo 4. Replace RECEIVER_EMAIL with the email where you want to receive messages
echo.
echo To generate Gmail App Password:
echo - Go to https://myaccount.google.com/security
echo - Enable 2-Step Verification
echo - Go to https://myaccount.google.com/apppasswords
echo - Generate an app password for Mail
echo.
pause
