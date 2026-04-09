@echo off
setlocal ENABLEDELAYEDEXPANSION
title ShopEase One-Click Start

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "SITE_SLUG=for-sell"
set "XAMPP_DIR=C:\xampp"
set "SITE_URL=http://localhost/%SITE_SLUG%"

echo ==============================================
echo   ShopEase - One Click Start
echo ==============================================
echo.

if not exist "%XAMPP_DIR%\php\php.exe" (
  echo [ERROR] XAMPP not found at: %XAMPP_DIR%
  echo Please install XAMPP in C:\xampp, then run this again.
  echo.
  pause
  exit /b 1
)

set "TARGET_DIR=%XAMPP_DIR%\htdocs\%SITE_SLUG%"

if not exist "%TARGET_DIR%" (
  echo [INFO] Creating project link in htdocs...
  mklink /J "%TARGET_DIR%" "%PROJECT_DIR%" >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] Failed to create link:
    echo         %TARGET_DIR%  ->  %PROJECT_DIR%
    echo Try running this file as Administrator once.
    echo.
    pause
    exit /b 1
  )
)

echo [INFO] Starting XAMPP services...
if exist "%XAMPP_DIR%\xampp_start.exe" (
  start "" "%XAMPP_DIR%\xampp_start.exe"
) else (
  start "" "%XAMPP_DIR%\xampp-control.exe"
)

echo [INFO] Waiting for services...
timeout /t 6 /nobreak >nul

echo [INFO] Running backend installer...
"%XAMPP_DIR%\php\php.exe" "%PROJECT_DIR%\backend\install.php"
if errorlevel 1 (
  echo [WARN] Installer could not complete. Check MySQL is running.
)

echo.
echo [INFO] Opening website...
start "" "%SITE_URL%/index.html"
start "" "%SITE_URL%/wp-admin.html"

echo.
echo ==============================================
echo  Ready.
echo  Admin Login: admin / admin123
echo  URL: %SITE_URL%
echo ==============================================
echo.
pause
