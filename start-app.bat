@echo off
echo 🚀 Starting ProductivU on your network...
echo.
echo 📱 Access URLs:
echo    • Local: http://localhost:3000
echo    • Network: http://192.168.213.22:3000
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.
serve -s dist -l 3000
