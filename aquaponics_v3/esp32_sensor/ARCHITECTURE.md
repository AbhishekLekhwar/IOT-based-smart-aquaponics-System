# 🏗️ Aquaponics Project Architecture: ESP32 + Raspberry Pi

## Complete System Diagram

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    AQUAPONICS MONITORING SYSTEM v2                        ║
║                     (ESP32 Sensors + RPi Camera)                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                          HARDWARE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────┐      ┌──────────────────────────┐         │
│  │   ESP32 (WiFi)          │      │  Raspberry Pi 4          │         │
│  │  ┌────────────────────┐  │      │  ┌────────────────────┐  │         │
│  │  │ Sensors            │  │      │  │ Camera Module      │  │         │
│  │  ├─ DHT22 (Temp+RH)   │  │      │  │ + Lens             │  │         │
│  │  ├─ pH Probe          │  │      │  └────────────────────┘  │         │
│  │  ├─ Water Level       │  │      │  WiFi/Ethernet          │         │
│  │  └─ Thermistor        │  │      │  (Same Network)         │         │
│  │                        │  │      │                         │         │
│  │ Update: Every 30s     │  │      │ Update: Every 5s        │         │
│  └────────┬───────────────┘  │      └────────┬────────────────┘         │
│           │                  │               │                           │
│           │ WiFi             │               │ WiFi                      │
│           │ (HTTP POST)      │               │ (HTTP POST)               │
└───────────┼──────────────────┼───────────────┼──────────────────────────┘
            │                  │               │
            │                  │               │
┌───────────┼──────────────────┼───────────────┼──────────────────────────┐
│           ↓                  ↓               ↓                           │
│  ┌────────────────────────────────────────────────┐                      │
│  │     BACKEND SERVER (Node.js + Express)        │                      │
│  │     Port: 5000                                │                      │
│  │                                               │                      │
│  │  ┌──────────────┐  ┌──────────────┐          │                      │
│  │  │   Routes     │  │ Controllers  │          │                      │
│  │  ├─ /sensors    │  ├─ sensorCtrl  │          │                      │
│  │  ├─ /camera     │  ├─ cameraCtrl  │          │                      │
│  │  ├─ /devices    │  ├─ deviceCtrl  │          │                      │
│  │  └─ /auth       │  └─ authCtrl    │          │                      │
│  │                 │                 │          │                      │
│  │  POST /sensors/data                          │                      │
│  │  ├─ Input: {deviceId, waterTemp, pH, ...}   │                      │
│  │  ├─ Validate                                 │                      │
│  │  ├─ Check thresholds → Generate alerts      │                      │
│  │  └─ Save to MongoDB                         │                      │
│  │                                              │                      │
│  │  POST /camera/snapshot                      │                      │
│  │  ├─ Input: base64 image, metadata           │                      │
│  │  ├─ Decode & validate                       │                      │
│  │  ├─ Store as binary in MongoDB              │                      │
│  │  └─ Mark as "latest" for quick access       │                      │
│  │                                              │                      │
│  │  WebSocket (/ws)                            │                      │
│  │  └─ Broadcast SENSOR_UPDATE & CAMERA_UPDATE │                      │
│  └──────────────┬───────────────┬───────────────┘                      │
│                 │               │                                       │
│  ┌──────────────┴───────────────┴────────────────┐                     │
│  │           MongoDB (Local/Cloud)              │                     │
│  │                                              │                     │
│  │  Collections:                                │                     │
│  │  ├─ sensor_readings                         │                     │
│  │  │  └─ {deviceId, temps, pH, level, ...}   │                     │
│  │  ├─ camera_images                           │                     │
│  │  │  └─ {imageId, piName, data:Buffer(...)} │                     │
│  │  ├─ users                                   │                     │
│  │  ├─ schedules                               │                     │
│  │  ├─ thresholds                              │                     │
│  │  └─ device_states                           │                     │
│  └──────────────────────────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
┌───────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Tailwind)                         │
│                    Port: 3000                                          │
│                                                                        │
│  ┌────────────────────────────────────────────────────────┐           │
│  │   Navigation                                            │           │
│  │   [🏠 Dashboard] [🎥 Camera] [📊 History] [⚠️ Alerts] │           │
│  │   [📡 System] [⚙️ Settings]                            │           │
│  └────────────────────────────────────────────────────────┘           │
│                                                                        │
│  ┌─────────────────────────┐  ┌────────────────────────┐             │
│  │   Dashboard Page        │  │   Camera Page          │             │
│  ├─────────────────────────┤  ├────────────────────────┤             │
│  │                         │  │                        │             │
│  │  Sensor Cards:          │  │  Live Camera Feed      │             │
│  │  ├─ Water Temp (°C)    │  │  ├─ Latest snapshot   │             │
│  │  ├─ Room Temp (°C)     │  │  ├─ Refresh toggle    │             │
│  │  ├─ pH Level           │  │  ├─ Photo history     │             │
│  │  ├─ Humidity (%)       │  │  └─ Cleanup tools     │             │
│  │  └─ Water Level (%)    │  │                        │             │
│  │                         │  │  Storage Stats:       │             │
│  │  Stats Panel:           │  │  ├─ Total images     │             │
│  │  ├─ Min/Max values      │  │  ├─ Oldest image     │             │
│  │  ├─ Alerts triggered    │  │  └─ Storage size     │             │
│  │  └─ Uptime              │  │                        │             │
│  │                         │  │  Last 24 Hours:      │             │
│  │  Alert Banner:          │  │  └─ Image gallery     │             │
│  │  └─ Critical alerts     │  │                        │             │
│  │                         │  │ Camera Sources:      │             │
│  │                         │  │ └─ aquaponics-pi-1   │             │
│  └─────────────────────────┘  └────────────────────────┘             │
│                                                                        │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │History Page │  │Alerts    │  │System    │  │Settings  │          │
│  ├─────────────┤  ├──────────┤  ├──────────┤  ├──────────┤          │
│  │Chart views  │  │History   │  │Health    │  │Thresholds│          │
│  │Date range   │  │Severity  │  │Uptime    │  │Schedule  │          │
│  │Export data  │  │Filters   │  │Devices   │  │Users     │          │
│  │CSV/JSON     │  │Ack/Clear │  │          │  │          │          │
│  └─────────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                        │
│  Real-time Updates via WebSocket:                                    │
│  ├─ Sensor data every 30s (ESP32 sends)                             │
│  ├─ Camera image every 5s (RPi sends)                              │
│  ├─ Alert notifications (backend generated)                        │
│  └─ System status updates                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequences

### Sequence 1: Sensor Data Path (Every 30 seconds)

```
ESP32
  └─ ADC reads sensors
  └─ Calculates averages (from 3 readings)
  └─ Formats JSON payload
  └─ HTTP POST to /api/sensors/data
        │
        └─→ Backend sensorController
              ├─ Validates fields
              ├─ checkThresholds() → generates alerts
              ├─ Saves to MongoDB sensor_readings
              ├─ Broadcasts to WebSocket
              │    └─→ All connected clients
              │         └─→ React updates Dashboard in real-time
              └─ Returns 201 Created

Frontend (React)
  ├─ Receives WebSocket SENSOR_UPDATE
  ├─ Updates SensorCard components
  ├─ Updates StatsPanel (min/max)
  ├─ Triggers AlertBanner if thresholds exceeded
  └─ Re-renders Dashboard
```

### Sequence 2: Camera Image Path (Every 5 seconds)

```
Raspberry Pi (camera_service.py)
  └─ Captures frame from camera module
  └─ Encodes to base64 PNG/JPEG
  └─ HTTP POST to /api/camera/snapshot
        │
        └─→ Backend cameraController
              ├─ Decodes base64
              ├─ Generates imageId (64-bit)
              ├─ Marks previous images as not "latest"
              ├─ Saves to MongoDB camera_images
              │    └─ Stores: metadata + binary Buffer
              ├─ Broadcasts to WebSocket
              │    └─→ All connected clients
              │         └─→ React updates CameraPanel
              └─ Returns 201 Created

Frontend (React)
  ├─ Receives WebSocket CAMERA_UPDATE
  ├─ Fetches latest snapshot via GET /api/camera/snapshot/aquaponics-pi-1
  ├─ Displays in CameraPanel (real-time updates)
  ├─ Displays in CameraPage (dedicated view)
  └─ Updates metadata (timestamp, resolution)
```

### Sequence 3: Alert Generation

```
Sensor Data Arrives
  └─ checkThresholds() evaluates:
       ├─ Is waterTemp < 18°C OR > 32°C? → WARNING
       ├─ Is pH < 6.2 OR > 8.5? → WARNING
       ├─ Is waterLevel < 20%? → CRITICAL
       ├─ Is humidity > 85%? → INFO
       └─ Create alert objects
            │
            ├─→ Saved with SensorReading
            ├─→ Broadcast to WebSocket
            └─→ Frontend AlertBanner displays
                  └─ User can acknowledge/dismiss alerts
```

---

## Network Topology

```
                    ┌─────────────────────────────────────┐
                    │  Home WiFi Network (192.168.1.0/24)  │
                    └─────────────────────────────────────┘
                           │          │          │
         ┌─────────────────┼──────────┼──────────┼────────────────┐
         │                 │          │          │                │
    ┌────▼─────┐      ┌────▼──┐  ┌──▼────┐  ┌──▼────┐       ┌────▼─────┐
    │ Router    │      │ESP32  │  │Rpi 4  │  │MacBook│       │Internet  │
    │192.168.1.1│      │192... │  │192... │  │192... │       │(optional)│
    └────┬─────┘      └────┬──┘  └──┬────┘  └──┬────┘       └────┬─────┘
         │                 │        │          │                │
         │  HTTP /api/*    │        │          │                │
         ├─────────────────┼────────┼────→ ┌───▼────────┐       │
         │                 │        │      │ Laptop/PC  │       │
         │                 │        │      │ (Backend+  │       │
         │                 │        │      │  Frontend) │       │
         │                 │        │      └────────────┘       │
         │                 │        │                            │
         └─────────────────┼────────┴────────────────────────────┘
                           │
                    MongoDB Database:
                    └─ Local: mongoose://localhost:27017
                    └─ Cloud: mongodb+srv://user:pass@cluster.mongodb.net
```

---

## Technology Stack

### Hardware
| Component | Purpose | Protocol |
|-----------|---------|----------|
| ESP32-WROOM-32 | Sensor hub | WiFi 802.11b/g/n |
| Raspberry Pi 4 | Camera streaming | WiFi/Ethernet |
| DHT22 | Temp + humidity | 1-wire digital |
| pH probe | Water chemistry | Analog (0-3.3V) |
| Thermistor | Water temperature | Analog (0-3.3V) |
| Float sensor | Tank level | Analog (0-3.3V) |

### Software
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Microcontroller | Arduino C++ | Sensor reading, WiFi transmission |
| Backend | Node.js + Express | REST API, WebSocket server |
| Database | MongoDB | Persistent storage, real-time queries |
| Frontend | React + Tailwind | Web dashboard, real-time UI |
| Deployment | Docker | Optional containerization |

---

## API Endpoints Overview

### Sensor Endpoints
```
POST   /api/sensors/data              ← ESP32 sends readings here
GET    /api/sensors/latest            → Get current sensor values
GET    /api/sensors/history           → Get historical data (paginated)
GET    /api/sensors/stats             → Get min/max/avg aggregates
GET    /api/sensors/alerts            → Get alert history
```

### Camera Endpoints
```
POST   /api/camera/snapshot           ← RPi sends images here
GET    /api/camera/snapshot/:piName   → Get latest image
GET    /api/camera/snapshot/:piName/base64 → Get as base64
GET    /api/camera/history/:piName    → Get previous images
GET    /api/camera/list               → List all cameras
DELETE /api/camera/image/:imageId     → Remove specific image
```

### Device Management
```
GET    /api/devices/list              → Get connected devices
PUT    /api/devices/:deviceId/config  → Update device settings
DELETE /api/devices/:deviceId         → Remove device
```

---

## Database Schema

### `sensor_readings` collection
```json
{
  "_id": ObjectId,
  "deviceId": "esp32-aquaponics-01",
  "waterTemperature": 24.5,
  "roomTemperature": 22.1,
  "humidity": 55.3,
  "waterLevel": 65,
  "ph": 6.8,
  "alerts": [
    {
      "type": "pH_OUT_OF_RANGE",
      "message": "Water pH above normal range",
      "severity": "warning"
    }
  ],
  "timestamp": ISODate("2024-04-17T15:32:10.000Z")
}
```

### `camera_images` collection
```json
{
  "_id": "12345678901234567890",
  "piName": "aquaponics-pi-1",
  "data": BinData(0, "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
  "width": 640,
  "height": 480,
  "format": "JPEG",
  "fileSize": 45000,
  "isLatest": true,
  "timestamp": ISODate("2024-04-17T15:32:10.000Z")
}
```

---

## Advantages of ESP32 + Raspberry Pi Setup

✅ **Separation of concerns**
- ESP32 handles sensor data exclusively (low power, reliable)
- Raspberry Pi handles camera/streaming (can be resource-heavy)

✅ **Scalability**
- Add multiple ESP32s for different aquaponics beds
- Each has unique `deviceId`, frontend auto-discovers all

✅ **Reliability**
- If RPi camera fails, sensor data continues
- If ESP32 fails, camera continues

✅ **Cost-effective**
- ESP32: $8-12 per unit
- No need for expensive sensor modules or shields

✅ **Power efficiency**
- ESP32 can sleep between readings (~2mA sleep vs 80mA active)
- RPi always-on but camera power can be managed

✅ **Ease of deployment**
- Flash ESP32 once, no maintenance needed
- RPi service runs as background process

---

## Future Enhancements

1. 📱 Mobile app (React Native)
2. 📊 Advanced analytics & ML (predict system failures)
3. 🤖 Automated controls (pump relay via ESP32 GPIO)
4. ☁️ Cloud sync (backup to AWS/Azure)
5. 🔔 SMS/Email alerts
6. 📹 Video recording (RPi → S3/Blob Storage)
7. 🌍 Multi-location dashboard (multiple aquaponics systems)

---

## Getting Started

1. **[ESP32 Quick Start](./ESP32_QUICK_START.md)** - 5-minute setup
2. **[ESP32 Full Setup](./ESP32_SETUP.md)** - Detailed hardware & calibration
3. **[Raspberry Pi Camera](../raspberry_pi_camera/CAMERA_SETUP.md)** - Already implemented
4. **[Backend API](../backend/README.md)** - Already running
5. **[Frontend Dashboard](../frontend/README.md)** - Already running

---

**Last updated:** April 17, 2024
**Version:** 2.0 (ESP32 + RPi Camera)
