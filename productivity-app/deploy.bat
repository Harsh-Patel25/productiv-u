@echo off
echo =========================================
echo   ProductivU - Cloud Deployment Script
echo =========================================
echo.

REM Build the project
echo [1/4] Building production version...
call npm run build
if errorlevel 1 (
    echo Error: Build failed!
    pause
    exit /b 1
)

REM Add changes to git
echo [2/4] Adding changes to git...
git add .
git commit -m "Update: %date% %time%"

REM Push to GitHub
echo [3/4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo Error: Git push failed!
    pause
    exit /b 1
)

REM Instructions for Vercel deployment
echo [4/4] Ready for Vercel deployment!
echo.
echo =========================================
echo   DEPLOYMENT COMPLETE!
echo =========================================
echo.
echo Your code has been pushed to GitHub.
echo.
echo To deploy to Vercel:
echo 1. Go to: https://vercel.com
echo 2. Login with GitHub (Harsh-Patel25)
echo 3. Click "Import Project"
echo 4. Select "productiv-u" repository
echo 5. Click "Deploy"
echo.
echo Your live URL will be: https://productiv-u-xyz.vercel.app
echo.
pause
