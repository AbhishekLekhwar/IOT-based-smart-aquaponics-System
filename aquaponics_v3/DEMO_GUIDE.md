# 🎬 Demo Data Generator Quick Start

## Overview

Two demo generators are provided to test your aquaponics system:

1. **demo_sensor_data.js** - Generates realistic sensor readings
2. **demo_camera_data.py** - Generates demo camera images

Both send data to the running backend server.

---

## Prerequisites

✅ **Backend must be running:**
```bash
cd backend
npm start
# Should show: 🌱 AquaMonitor Server → http://localhost:5000
```

✅ **Frontend should be running:**
```bash
cd frontend
npm start
# Should show: webpack compiled successfully
# Open browser: http://localhost:3000
```

---

## Demo 1: Sensor Data Generator

### Run Demo Sensor Data

```bash
cd aquaponics_v3
node demo_sensor_data.js
```

### What It Does

- Generates 10 realistic sensor readings
- Simulates water temperature oscillations (22-26°C)
- Simulates pH variations (6.5-7.1)
- Sends data to `/api/sensors/data` endpoint
- 2-second delay between readings

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║     🌱 Aquaponics Demo Sensor Data Generator v1.0         ║
╚════════════════════════════════════════════════════════════╝

Generating 10 sensor readings...
Target: http://localhost:5000/api/sensors/data

✓ Sent #1:
  Water Temp: 24.2°C
  Room Temp: 23.5°C
  Humidity: 58.3%
  Water Level: 72.1%
  pH: 6.85

✓ Sent #2:
  Water Temp: 24.5°C
  ...
```

### Real-Time Dashboard Updates

After running, your dashboard should immediately show:
- 🔄 Dashboard sensor cards updating in real-time
- 📊 Charts showing new data points
- 🔔 Alerts triggering if thresholds exceeded
- ✨ WebSocket live updates (green border on components)

---

## Demo 2: Camera Image Generator

### Requirements

```bash
# Install Pillow (PIL) for image generation
pip install Pillow requests
```

### Run Demo Camera Data

```bash
cd aquaponics_v3
python demo_camera_data.py
```

### What It Does

- Generates 5 synthetic aquaponics tank images
- Includes temperature, pH, water level info overlay
- Adds timestamp and frame counter
- Sends to `/api/camera/snapshot` endpoint
- 3-second delay between uploads

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║      🌱 Aquaponics Demo Camera Image Generator v1.0       ║
╚════════════════════════════════════════════════════════════╝

Generating 5 demo images...
Target: http://localhost:5000/api/camera/snapshot

📸 Generating image #1...
  Uploading to backend...
  ✓ Uploaded successfully
  Image ID: 12345678901234567890
  Size: 45.2 KB

📸 Generating image #2...
  ...
```

### Real-Time Dashboard Updates

After running, your dashboard should show:
- 📷 Camera Page displays latest image
- 🔄 Image updates in real-time
- 📊 Image metadata (resolution, size, timestamp)
- 📹 History showing all 5 images

---

## Running Both Demos Simultaneously

Open multiple terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

**Terminal 3 (Sensor Demo):**
```bash
cd aquaponics_v3
node demo_sensor_data.js
```

**Terminal 4 (Camera Demo):**
```bash
cd aquaponics_v3
python demo_camera_data.py
```

---

## Complete Demo Data Flow

```
Demo Generators → REST API Endpoints → Backend Processing → MongoDB Storage → Frontend via WebSocket

Sensor Data Flow:
  demo_sensor_data.js
    ↓ HTTP POST
  /api/sensors/data
    ↓ Backend validation
  MongoDB (sensor_readings collection)
    ↓ WebSocket broadcast
  Frontend real-time update
    ↓
  Dashboard cards + Charts

Camera Data Flow:
  demo_camera_data.py
    ↓ HTTP POST (base64 image)
  /api/camera/snapshot
    ↓ Backend decode & storage
  MongoDB (camera_images collection)
    ↓ WebSocket broadcast
  Frontend real-time update
    ↓
  Camera page + Latest snapshot
```

---

## Expected Dashboard Behavior

### After Running Sensor Demo

✅ Dashboard shows:
- Water temperature: ~24.2°C
- Room temperature: ~23.5°C
- Humidity: ~58.3%
- Water level: ~72%
- pH: ~6.85
- Real-time values update every 2 seconds (with animation)

✅ Real-time indicators:
- 🟢 Green border on updating components
- ⚡ Socket connected indicator active
- 📊 Line charts update with new data points

### After Running Camera Demo

✅ Camera page shows:
- Latest image with tank information overlay
- Resolution: 640x480
- File size: ~45 KB
- Timestamp (when image was generated)
- Image history showing all 5 images

✅ Real-time indicators:
- 🔄 Camera "Refresh" button active
- 📷 Latest frame displays
- ⏱️ Timestamp automatically updates

---

## API Endpoints Being Called

### Sensor Endpoint
```
POST /api/sensors/data
Content-Type: application/json

{
  "deviceId": "demo-sensor-unit-01",
  "waterTemperature": 24.2,
  "roomTemperature": 23.5,
  "humidity": 58.3,
  "waterLevel": 72.1,
  "ph": 6.85
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "...",
    "deviceId": "demo-sensor-unit-01",
    ...
  }
}
```

### Camera Endpoint
```
POST /api/camera/snapshot
Content-Type: application/json

{
  "piName": "demo-pi-camera-01",
  "image_data": "base64encodedimagedata...",
  "resolution": "640x480",
  "format": "JPEG"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "imageid123",
    "piName": "demo-pi-camera-01",
    ...
  }
}
```

---

## Troubleshooting

### "Cannot find module 'requests'"
```bash
pip install requests
```

### "Cannot find module 'Pillow'"
```bash
pip install Pillow
```

### "Connection refused" Error
- Verify backend is running: `npm start` in backend folder
- Check if port 5000 is open: `curl http://localhost:5000/api/health`
- Ensure no firewall blocking localhost:5000

### Images Not Appearing in Dashboard
- Verify frontend is running: `npm start` in frontend folder
- Check browser console for errors (F12 → Console)
- Verify camera endpoint is responding: `curl http://localhost:5000/api/camera/list`

### Sensor Data Not Updating
- Check WebSocket connection in browser DevTools
- Verify backend is logged with "WS client connected"
- Try refreshing dashboard page

---

## Next Steps After Demo

1. **Modify Demo Data** - Edit `demo_sensor_data.js` to test different scenarios
2. **Create Alert Scenarios** - Generate data outside thresholds to test alerts
3. **Test Multiple Devices** - Change `deviceId` to simulate multiple sensors
4. **Stream Live Data** - Replace demo generators with actual ESP32 or RPi camera

---

## Real Data Integration

When ready to use actual hardware:

### For Sensor Data (ESP32)
Replace demo node script with ESP32 Arduino code from `esp32_sensor/esp32_aquaponics.ino`

### For Camera Data (Raspberry Pi)
Replace demo Python script with actual service from `raspberry_pi_camera/camera_service.py`

---

**Demo Status**: ✅ Ready to test!

Check [SYSTEM_STATUS.md](./SYSTEM_STATUS.md) for full system overview.
