# 🎥 Raspberry Pi Camera Integration Guide

Complete guide for adding video/image streaming from Raspberry Pi to your aquaponics system.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Hardware Requirements](#hardware-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [API Reference](#api-reference)
- [Frontend Display](#frontend-display)
- [Troubleshooting](#troubleshooting)

---

## Overview

This integration allows the Raspberry Pi camera to:
- ✅ Capture periodic snapshots from the camera module
- ✅ Send images via WiFi to the backend server
- ✅ Store images in MongoDB with metadata
- ✅ Display live feed in the dashboard
- ✅ View image history
- ✅ Manage storage with cleanup tools

**Data Flow:**
```
Raspberry Pi Camera
    ↓ (USB/CSI interface)
Python Camera Service (camera_service.py)
    ↓ (PNG/JPEG + base64)
WiFi Network
    ↓ (HTTP POST)
Backend API (/api/camera/snapshot)
    ↓ (saves to MongoDB)
Database (camera_images collection)
    ↓ (WebSocket/HTTP GET)
React Dashboard (CameraPanel component)
    ↓
Display in Browser
```

---

## Architecture

### Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Camera Service** | Captures and sends images | Python 3.8+, Bleak, aiohttp |
| **Backend Controller** | Receives and stores images | Node.js, Express, MongoDB |
| **Frontend Component** | Displays images | React, Tailwind CSS |
| **Database** | Stores image binary data | MongoDB (camera_images collection) |

### Directory Structure

```
aquaponics_v3/
├── raspberry_pi_camera/
│   ├── camera_service.py      # Main Python service
│   ├── requirements.txt        # Python dependencies
│   ├── .env                   # Configuration
│   └── CAMERA_SETUP.md        # Setup guide
├── backend/
│   ├── controllers/
│   │   └── cameraController.js
│   ├── routes/
│   │   └── cameraRoutes.js
│   ├── server.js              # Updated with camera routes
│   └── package.json           # Updated dependencies
└── frontend/
    └── src/components/dashboard/
        └── CameraPanel.jsx
```

---

## Hardware Requirements

### Minimum Requirements
- **Raspberry Pi 3B+** or newer (Pi 4B recommended)
- **Camera Module**: Official Pi Camera or compatible USB camera
- **WiFi Connection**: Built-in or USB WiFi adapter
- **Storage**: 64GB SD card recommended (for image history)
- **Power**: 5V 2.5A power supply

### Optional
- **Pan-Tilt Mount** for camera positioning
- **Waterproof Housing** for aquaponics environment
- **Infrared Camera Module** for night vision

### Official Camera Modules
- Raspberry Pi Camera Module 3 (12MP, recommended)
- Raspberry Pi Camera Module 3 Wide (12MP, 120° FOV)
- High Quality Camera (12.3MP, external lens)

---

## Installation

### Step 1: Prepare Raspberry Pi

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
sudo apt-get install -y python3-pip python3-dev python3-venv

# Enable Camera in raspi-config
sudo raspi-config
# → Interfacing Options → Camera → Enable
# → Reboot
```

### Step 2: Install Python Service

```bash
# Navigate to camera service directory
cd ~/aquaponics_project/aquaponics_v3/raspberry_pi_camera

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test camera connection
python3 -c "from picamera2 import Picamera2; print('✓ Camera module available')"
```

### Step 3: Configure Backend

The backend is already configured with:
- ✅ Camera routes registered (`/api/camera/*`)
- ✅ Increased JSON payload limit (50MB)
- ✅ Camera controller with CRUD operations

No additional setup needed unless using custom database.

### Step 4: Frontend is Ready

The CameraPanel is already integrated into the Dashboard:
- ✅ Component created: `frontend/src/components/dashboard/CameraPanel.jsx`
- ✅ Imported in Dashboard.jsx
- ✅ Displays live camera feed with controls

---

## Configuration

### Environment Variables

Edit `raspberry_pi_camera/.env`:

```env
# Backend connection
BACKEND_URL=http://localhost:5000    # Or your server IP
PI_NAME=aquaponics-pi-1              # Unique name for this Pi

# Camera settings
CAMERA_INTERVAL=5                    # Capture every N seconds
CAMERA_RESOLUTION=640x480            # Width x Height
CAMERA_QUALITY=85                    # JPEG quality (1-100)
ENABLE_VIDEO_STREAM=true             # Enable MJPEG streaming

# Debug
DEBUG=true                           # Enable verbose logging
```

### Common Configurations

**High Quality (Best for Detail)**
```env
CAMERA_RESOLUTION=1920x1080
CAMERA_QUALITY=95
CAMERA_INTERVAL=10
```

**Balanced (Default)**
```env
CAMERA_RESOLUTION=640x480
CAMERA_QUALITY=85
CAMERA_INTERVAL=5
```

**Low Bandwidth (Remote/Mobile)**
```env
CAMERA_RESOLUTION=320x240
CAMERA_QUALITY=70
CAMERA_INTERVAL=10
```

**Night Mode (High ISO)**
```env
CAMERA_RESOLUTION=640x480
CAMERA_QUALITY=80
CAMERA_INTERVAL=2
```

---

## Running the Service

### Option 1: Manual Run

```bash
cd ~/aquaponics_project/aquaponics_v3/raspberry_pi_camera
source venv/bin/activate
python camera_service.py
```

### Option 2: Run in Background (Linux)

```bash
# Using tmux
tmux new-session -d -s camera "cd raspberry_pi_camera && source venv/bin/activate && python camera_service.py"

# Or using nohup
nohup python camera_service.py > camera.log 2>&1 &
```

### Option 3: Run as Systemd Service

Create `/etc/systemd/system/aqua-camera.service`:

```ini
[Unit]
Description=Aquaponics Camera Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/aquaponics_project/aquaponics_v3/raspberry_pi_camera
ExecStart=/home/pi/aquaponics_project/aquaponics_v3/raspberry_pi_camera/venv/bin/python camera_service.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable aqua-camera
sudo systemctl start aqua-camera
sudo systemctl status aqua-camera
```

### Option 4: Docker Container

```bash
docker build -t aqua-camera -f raspberry_pi_camera/Dockerfile .
docker run -d \
  --name aqua-camera \
  -e BACKEND_URL=http://docker.host.internal:5000 \
  -e PI_NAME=aquaponics-pi-1 \
  --device /dev/video0 \
  aqua-camera
```

---

## API Reference

### Receive Snapshot
```
POST /api/camera/snapshot
Content-Type: application/json

{
  "pi_name": "aquaponics-pi-1",
  "timestamp": "2024-01-15T10:30:45Z",
  "image_data": "base64encodedimagedata...",
  "resolution": "640x480",
  "image_type": "jpeg"
}

Response: {
  "status": "success",
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_size": 45230,
  "total_images": 42
}
```

### Get Latest Snapshot (Binary)
```
GET /api/camera/snapshot/:piName
Content-Type: image/jpeg

Response: [binary image data]
```

### Get Latest Snapshot (Base64)
```
GET /api/camera/snapshot/:piName/base64

Response: {
  "image_id": "550e8400...",
  "pi_name": "aquaponics-pi-1",
  "image_data": "base64...",
  "timestamp": "2024-01-15T10:30:45Z",
  "resolution": "640x480"
}
```

### Get Image History
```
GET /api/camera/history/:piName?limit=20&skip=0

Response: {
  "pi_name": "aquaponics-pi-1",
  "total": 150,
  "images": [
    {
      "image_id": "550e8400...",
      "timestamp": "2024-01-15T10:30:45Z",
      "resolution": "640x480",
      "file_size": 45230,
      "is_recent": true
    }
  ]
}
```

### Get All Cameras
```
GET /api/camera/list

Response: {
  "cameras": [
    {
      "_id": "aquaponics-pi-1",
      "latest_image_id": "550e8400...",
      "latest_timestamp": "2024-01-15T10:30:45Z",
      "total_images": 150,
      "total_size": 6789000
    }
  ],
  "total_cameras": 1
}
```

### Get Storage Stats
```
GET /api/camera/stats

Response: {
  "total_images": 250,
  "total_size_mb": "125.3",
  "by_camera": [
    {
      "_id": "aquaponics-pi-1",
      "count": 250,
      "total_size_bytes": 131379200,
      "total_size_mb": 125.3,
      "latest": "2024-01-15T10:30:45Z"
    }
  ]
}
```

### Delete Image
```
DELETE /api/camera/image/:imageId

Response: {
  "status": "success",
  "message": "Image deleted"
}
```

### Cleanup Old Images
```
DELETE /api/camera/pi/:piName/old?keep=5

Response: {
  "status": "success",
  "deleted_count": 145,
  "kept_count": 5,
  "message": "Kept 5 latest images"
}
```

---

## Frontend Display

The dashboard includes a **CameraPanel** component with:

### Features
- 📺 **Live Preview**: Shows latest snapshot from each Pi
- 📜 **History View**: Browse all captured images
- 🔄 **Auto-Refresh**: Automatic updates (configurable interval)
- 📊 **Storage Stats**: See total images and storage usage
- 🗑️ **Cleanup Tools**: Delete individual images or batch cleanup
- 📱 **Responsive**: Works on desktop and mobile

### Component Location
```
frontend/src/components/dashboard/CameraPanel.jsx
```

### Integrated Into
```
frontend/src/pages/Dashboard.jsx (line ~140)
```

### Usage Example
```jsx
import CameraPanel from '../components/dashboard/CameraPanel';

export function MyPage() {
  return (
    <div>
      <CameraPanel />
    </div>
  );
}
```

---

## Troubleshooting

### Camera Not Detected

**Problem**: `PermissionError: [Errno 13] Permission denied`

**Solution**:
```bash
# Add user to video group
sudo usermod -aG video $USER
# Logout and login again
exit
```

### Connection Timeout

**Problem**: Service can't reach backend

**Solution**:
```bash
# Check network connectivity
ping <backend-ip>
# Verify backend is running
curl http://localhost:5000/api/health
# Update BACKEND_URL in .env
```

### Low-Quality Images

**Problem**: Images are blurry or dark

**Solution**:
```env
# Auto-focus settings
CAMERA_QUALITY=95
CAMERA_INTERVAL=2

# Or disable auto-adjustments in code
# and manually configure focus distance
```

### Storage Using Too Much Space

**Problem**: MongoDB growing rapidly

**Solution**:
```bash
# Clean up old images (keep last 50)
curl -X DELETE "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=50"

# Check storage stats
curl http://localhost:5000/api/camera/stats
```

### Service Crashes

**Problem**: Process exits unexpectedly

**Solution**:
```bash
# Enable debug logging
DEBUG=true

# Capture output to file
python camera_service.py > camera.log 2>&1 &

# Check logs
tail -f camera.log
```

### Demo Mode (No Camera)

**Status**: Service runs without hardware camera

**Behavior**: Generates placeholder images with timestamp

**Use Case**: Testing on PC before deploying to Pi

---

## Example: Complete Setup

### 1. Fresh Raspberry Pi Installation

```bash
# SSH into Pi
ssh pi@<pi-ip>

# Clone project
git clone <repo-url>
cd aquaponics_project/aquaponics_v3

# Setup camera service
cd raspberry_pi_camera
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
nano .env  # Set BACKEND_URL to your server IP

# Run
python camera_service.py
```

### 2. Backend Already Running
```bash
# Verify routes are registered
curl http://localhost:5000/api/camera/list

# Expected: {"cameras": [], "total_cameras": 0}
```

### 3. Frontend Display
```bash
# Navigate to dashboard
http://localhost:3000

# You should see CameraPanel component
# It will show "No cameras connected" until Pi service starts
```

### 4. First Image Captured
```bash
# Monitor dashboard
# Within 5 seconds (default interval), image should appear

# Verify in database
curl http://localhost:5000/api/camera/stats
```

---

## Performance Tips

| Setting | Performance | Storage | Quality |
|---------|-------------|---------|---------|
| **High Perf** | 10 fps | ❌ | ✅ |
| **Balanced** | 0.2 fps (5s interval) | ✅ | ✅ |
| **Low Bandwidth** | 0.1 fps (10s interval) | ✅ | ⚠️ |

### For 24/7 Operation
```env
CAMERA_INTERVAL=10
CAMERA_RESOLUTION=320x240
CAMERA_QUALITY=70
```
**Storage**: ~50MB per day (1200 images)

### For Detail Capture
```env
CAMERA_INTERVAL=60
CAMERA_RESOLUTION=1920x1080
CAMERA_QUALITY=90
```
**Storage**: ~100MB per day (1440 images)

---

## Advanced: Multiple Cameras

To add a second camera:

```bash
# Create new service directory
mkdir raspberry_pi_camera_2
cp -r raspberry_pi_camera/* raspberry_pi_camera_2/

# Configure
cd raspberry_pi_camera_2
nano .env
# Set PI_NAME=aquaponics-pi-2

# Run alongside first service
python camera_service.py &
```

Dashboard will auto-detect both cameras in the CameraPanel.

---

## Next Steps
- ✅ Start camera service
- ✅ Verify images appear in dashboard
- ✅ Configure resolution for your use case
- ✅ Set up automatic cleanup schedule
- ✅ Consider adding pan-tilt control
- ✅ Explore time-lapse recording

**Need help?** Check the [Main README](../README.md) or [Troubleshooting Guide](../TROUBLESHOOTING.md)
