@echo off
REM 🌱 Aquaponics Demo Runner - Windows Batch Script
REM This script runs both sensor and camera demos

title Aquaponics Demo Runner
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🌱 Aquaponics Complete Demo Runner - Windows v1.0     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if backend is running
echo 📋 Checking backend connectivity...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 2 -ErrorAction Stop; exit 0 } catch { exit 1 }" >nul 2>&1

if errorlevel 1 (
    echo.
    color 0C
    echo ✗ Backend not accessible at http://localhost:5000
    echo.
    color 0B
    echo Please ensure:
    echo   1. Backend is running: cd backend ^&^& npm start
    echo   2. Port 5000 is not blocked
    echo   3. MongoDB is running
    echo.
    pause
    exit /b 1
)

echo ✓ Backend is running
echo.

REM Show configuration
echo ⚙️  Demo Configuration:
echo   Backend URL: http://localhost:5000
echo   Frontend URL: http://localhost:3000
echo   Sensor Demo: 10 readings @ 2-second intervals
echo   Camera Demo: 5 images @ 3-second intervals
echo.

REM Show view options
echo 📺 View Options:
echo   1. Open http://localhost:3000 in your browser
echo   2. Watch sensor cards update in real-time
echo   3. Check camera page for generated images
echo.

echo 🚀 Starting demos...
echo.

REM Run sensor demo
echo.
echo 📊 Running Sensor Demo
echo ════════════════════════════════════════════════════════════
node demo_sensor_data.js

if errorlevel 1 (
    color 0C
    echo ✗ Sensor demo failed
    pause
    exit /b 1
)

echo.
echo ⏱️  Waiting 2 seconds before camera demo...
timeout /t 2 /nobreak

REM Run camera demo
echo.
echo 📷 Running Camera Demo
echo ════════════════════════════════════════════════════════════
python demo_camera_data.py

if errorlevel 1 (
    color 0C
    echo ✗ Camera demo failed
    pause
    exit /b 1
)

REM Success summary
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            ✅ Demo Run Complete!                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

color 0B
echo 📊 Sensor Demo Results:
echo   • 10 readings sent successfully
echo   • Check dashboard for real-time updates
echo.

echo 📷 Camera Demo Results:
echo   • 5 images generated and uploaded
echo   • Check Camera page to preview
echo.

echo 🎯 Next Steps:
echo   1. Verify sensor values on dashboard
echo   2. Verify camera images on Camera page
echo   3. Check alerts page for any triggered alerts
echo   4. Review system health status
echo.

echo 📚 For more information:
echo   • See DEMO_GUIDE.md for detailed instructions
echo   • See ESP32_QUICK_START.md for hardware setup
echo   • See ARCHITECTURE.md for system overview
echo.

pause
exit /b 0
