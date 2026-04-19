# 🏗️ System Architecture Overview

## High-Level System Diagram

```
┌──────────────────────────── YOUR COMPUTER ────────────────────────────┐
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    🌍 WINDOWS MACHINE                          │ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │              🔵 BLUETOOTH SENSORS (Wireless)             │  │ │
│  │  ├──────────────────────────────────────────────────────────┤  │ │
│  │  │  • Temperature Sensor ──┐                              │  │ │
│  │  │  • PH Sensor          ├──→ 📡 Bluetooth Radio          │  │ │
│  │  │  • Humidity Sensor    ├──→ (Wireless Connection)       │  │ │
│  │  │  • Water Level Sensor ┘                              │  │ │
│  │  └──────────────────────┬───────────────────────────────────┘  │ │
│  │                         │ (Bluetooth 5m range)                 │ │
│  │                         ↓                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │       🐍 PYTHON BLE SERVICE (ble_scanner.py)            │  │ │
│  │  ├──────────────────────────────────────────────────────────┤  │ │
│  │  │ • Scans BLE devices every 10 seconds                    │  │ │
│  │  │ • Connects and reads sensor values                      │  │ │
│  │  │ • Parses data (converts bytes → JSON)                  │  │ │
│  │  │ • Formats:                                             │  │ │
│  │  │   {                                                    │  │ │
│  │  │     deviceId: "aquaponics-unit-01",                   │  │ │
│  │  │     waterTemperature: 24.5,                           │  │ │
│  │  │     roomTemperature: 26.0,                            │  │ │
│  │  │     humidity: 65.0,                                   │  │ │
│  │  │     waterLevel: 85.0,                                 │  │ │
│  │  │     ph: 7.2                                           │  │ │
│  │  │   }                                                    │  │ │
│  │  └──────────────────────┬───────────────────────────────────┘  │ │
│  │                         │ (HTTP POST request)                  │ │
│  │                         ↓                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │   🟢 NODE.js BACKEND (Express on :5000)                │  │ │
│  │  ├──────────────────────────────────────────────────────────┤  │ │
│  │  │ Input: POST /api/sensors/data                          │  │ │
│  │  │                                                         │  │ │
│  │  │ Process:                                               │  │ │
│  │  │ • Validate incoming sensor data                        │  │ │
│  │  │ • Check thresholds (temperature, humidity, etc.)      │  │ │
│  │  │ • Generate alerts if thresholds exceeded              │  │ │
│  │  │ • Save to MongoDB                                     │  │ │
│  │  │ • Calculate statistics                                │  │ │
│  │  │                                                         │  │ │
│  │  │ Output: Broadcast via WebSocket                        │  │ │
│  │  │ {                                                       │  │ │
│  │  │   type: "SENSOR_UPDATE",                              │  │ │
│  │  │   data: { readings object }                           │  │ │
│  │  │ }                                                       │  │ │
│  │  └──────────────────────┬───────────────────────────────────┘  │ │
│  │                         │                                      │ │
│  │        ┌────────────────┼────────────────┐                    │ │
│  │        │                │                │                    │ │
│  │        ↓ WebSocket      ↓ HTTP API      ↓ MongoDB            │ │
│  │        │                │                │                    │ │
│  │  ┌─────────────────┐  ┌──────────────┐ ┌────────────────┐   │ │
│  │  │ WebSocket       │  │ REST API     │ │    Database    │   │ │
│  │  │ Server          │  │ Endpoints    │ │   (MongoDB)    │   │ │
│  │  ├─────────────────┤  ├──────────────┤ ├────────────────┤   │ │
│  │  │ Ongoing stream  │  │ GET /latest  │ │ Stores:        │   │ │
│  │  │ of sensor       │  │ GET /history │ │ • Readings     │   │ │
│  │  │ updates to      │  │ GET /stats   │ │ • Users        │   │ │
│  │  │ connected       │  │ POST /data   │ │ • Schedules    │   │ │
│  │  │ clients         │  │ DELETE /     │ │ • Thresholds   │   │ │
│  │  └────────┬────────┘  └──────────────┘ └────────────────┘   │ │
│  │           │                                                   │ │
│  │           │ (WebSocket stable connection)                    │ │
│  │           ↓                                                   │ │
│  │     ┌──────────────────────────────────────────────────────┐ │ │
│  │     │         ⚛️ REACT FRONTEND (:3000)                   │ │ │
│  │     ├──────────────────────────────────────────────────────┤ │ │
│  │     │ • App.jsx - Main component                         │ │ │
│  │     │ • useWebSocket hook - Connects to backend          │ │ │
│  │     │ • Pages:                                           │ │ │
│  │     │   - Dashboard (live sensor display)                │ │ │
│  │     │   - History (charts)                               │ │ │
│  │     │   - Alerts (notification view)                     │ │ │
│  │     │   - Settings (configuration)                       │ │ │
│  │     │ • Components:                                      │ │ │
│  │     │   - SensorCard (individual sensor display)         │ │ │
│  │     │   - TemperatureChart (real-time chart)             │ │ │
│  │     │   - AlertBanner (alert notifications)              │ │ │
│  │     │   - ControlPanel (device controls)                 │ │ │
│  │     │                                                    │ │ │
│  │     │ State Management: Redux/Context                    │ │ │
│  │     │ - sensor readings                                  │ │ │
│  │     │ - user authentication                              │ │ │
│  │     │ - alerts                                           │ │ │
│  │     │ - connection status                                │ │ │
│  │     └──────────────────────────────────────────────────────┘ │ │
│  │                         ↑                                    │ │
│  │                         │                                    │ │
│  │              ┌──────────────────────────────┐              │ │
│  │              │   🌐 BROWSER DISPLAY         │              │ │
│  │              ├──────────────────────────────┤              │ │
│  │              │ ✅ Connected                │              │ │
│  │              │ Last: Just now              │              │ │
│  │              │                             │              │ │
│  │              │ 💧 Water Temp:  24.5°C     │              │ │
│  │              │ 🌡️  Room Temp:  26.0°C     │              │ │
│  │              │ 💨 Humidity:    65%        │              │ │
│  │              │ 🌊 Water Level: 85%        │              │ │
│  │              │ 🧪 pH:          7.2        │              │ │
│  │              │                             │              │ │
│  │              │ 📈 Charts Update Live       │              │ │
│  │              └──────────────────────────────┘              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

DATA UPDATE CYCLE (Every 5-10 Seconds):

  BLE Sensor ──┬──→ Python Service ──┬──→ Backend API ──┬──→ WebSocket
   (Bluetooth) │  (ble_scanner.py)  │  (Express)     │  (JSON msg)
               │                    │                │
           Collect         Parse & Format      Validate &       Broadcast
           reading         as JSON             Store to DB      to Frontend
               │                    │                │
               └──────────────────→ POST /api/sensors/data ──→ Frontend
                                                              (WebSocket)
                                                                  │
                                                                  ↓
                                      React receives message → Updates state
                                             │
                                             ↓
                                      Components re-render
                                             │
                                             ↓
                                      You see numbers change! 📊
```

---

## Service Communication Map

```
SERVICE PORTS & CONNECTIONS

┌─────────────────────┬─────────────────────┬──────────────────────────────┐
│     SERVICE         │      URL            │       PURPOSE                │
├─────────────────────┼─────────────────────┼──────────────────────────────┤
│ Frontend (React)    │ localhost:3000      │ Web dashboard (browser)      │
│ Backend (Express)   │ localhost:5000      │ REST API + WebSocket         │
│ MongoDB             │ localhost:27017     │ Database (internal only)     │
│ Bluetooth Service   │ (local process)     │ Sensor data collection       │
└─────────────────────┴─────────────────────┴──────────────────────────────┘

COMMUNICATION FLOW

Frontend Browser (localhost:3000)
        │
        ├──→ HTTP GET  → API endpoints (http://localhost:5000/api/...)
        │
        └──→ WebSocket → ws://localhost:5000/ws (bidirectional)
        
        
Backend Express (localhost:5000)
        │
        ├← HTTP POST ← BLE Service (sensor data ingestion)
        │
        ├← HTTP GET  ← API queries (history, stats, etc.)
        │
        ├→ WebSocket → Frontend (real-time updates)
        │
        └↔ MongoDB   ↔ Database (internal, localhost:27017)
        

Bluetooth Service (Local Process)
        │
        ├← Bluetooth ← BLE Sensors (wireless connection)
        │
        └→ HTTP POST → Backend API (send collected data)
```

---

## Data Model

```
SENSOR READING (Stored in MongoDB)

{
  _id: ObjectId,
  deviceId: "aquaponics-unit-01",
  waterTemperature: 24.5,        ← From BLE sensor
  roomTemperature: 26.0,         ← From BLE sensor
  humidity: 65.0,                ← From BLE sensor
  waterLevel: 85.0,              ← From BLE sensor
  ph: 7.2,                       ← From BLE sensor
  alerts: [
    {
      type: "TEMP_HIGH",
      message: "Water temperature high",
      severity: "warning"
    }
  ],
  timestamp: "2024-01-15T10:30:45Z"
}

Each reading contains all 5 sensor values + timestamp + any alerts generated
```

---

## Request/Response Examples

### 1. BLE Service → Backend

**Request (HTTP POST):**
```
POST /api/sensors/data HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "deviceId": "aquaponics-unit-01",
  "waterTemperature": 24.5,
  "roomTemperature": 26.0,
  "humidity": 65.0,
  "waterLevel": 85.0,
  "ph": 7.2
}
```

**Response:**
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deviceId": "aquaponics-unit-01",
    "waterTemperature": 24.5,
    ...
    "timestamp": "2024-01-15T10:30:45Z"
  }
}
```

---

### 2. Backend → Frontend (WebSocket)

**WebSocket Message (Server → Client):**
```json
{
  "type": "SENSOR_UPDATE",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deviceId": "aquaponics-unit-01",
    "waterTemperature": 24.5,
    "roomTemperature": 26.0,
    "humidity": 65.0,
    "waterLevel": 85.0,
    "ph": 7.2,
    "alerts": [],
    "timestamp": "2024-01-15T10:30:45Z"
  }
}
```

**Frontend JavaScript Receives:**
```javascript
socket.on('SENSOR_UPDATE', (data) => {
  // Update React state
  setSensorData(data);
  // Component re-renders with new values
});
```

---

### 3. Frontend → Backend (REST API)

**Request (HTTP GET):**
```
GET /api/sensors/latest?deviceId=aquaponics-unit-01 HTTP/1.1
Host: localhost:5000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "waterTemperature": 24.5,
    ...
  }
}
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   REACT APPLICATION                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App.jsx (Main Container)                             │
│  ├─ useWebSocket() → Connects to backend               │
│  ├─ Router → Pages                                    │
│  └─ AppContext → Global state                         │
│                                                         │
│  Pages:                                                 │
│  ├─ Dashboard                                          │
│  │  ├─ SensorCard (Temperature)                       │
│  │  ├─ SensorCard (Humidity)                          │
│  │  ├─ SensorCard (Water Level)                       │
│  │  ├─ SensorCard (pH)                                │
│  │  ├─ StatsPanel                                     │
│  │  ├─ TemperatureChart                               │
│  │  ├─ PHChart                                        │
│  │  └─ WaterLevelGauge                                │
│  │                                                     │
│  ├─ HistoryPage                                       │
│  │  └─ Charts from historical data                    │
│  │                                                     │
│  ├─ AlertsPage                                        │
│  │  └─ List of triggered alerts                       │
│  │                                                     │
│  └─ SettingsPage                                      │
│     └─ Configuration & user settings                  │
│                                                         │
│  All pages connected by:                               │
│  • AppContext (global state)                          │
│  • useWebSocket hook (real-time updates)              │
│                                                         │
└─────────────────────────────────────────────────────────┘

 Every WebSocket message triggers:
 1. State update
 2. Component re-render
 3. UI displays new values
 4. Charts animate
 5. Duration: ~100ms (imperceptible)
```

---

## Deployment Topology

```
DEVELOPMENT (Current Setup)

┌────────────────────────────────────┐
│    Your Windows Computer           │
├────────────────────────────────────┤
│ Terminal 1: npm start (backend)   │
│ Terminal 2: npm start (frontend)  │
│ Terminal 3: python ble_scanner.py │
│            or node simulator.js   │
│                                   │
│ Browser: http://localhost:3000   │
└────────────────────────────────────┘


PRODUCTION (Possible Deployment)

┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  Local Machine       │    │   Azure Cloud        │    │   Your Home  │
│  (Bluetooth + Py)    │    │   (Backend + DB)     │    │   (Browser)  │
├──────────────────────┤    ├──────────────────────┤    ├──────────────┤
│ ble_scanner.py ──────┼───→ App Service ────────┼───→ Internet ──────┼
│                      │    (Express API)        │    (HTTP/WS)       │
│ BLE Sensors ────────→│    │                    │                    │
└──────────────────────┘    │ MongoDB ──────┐    │                    │
                            │    Database   │    └──────────────────┘
                            └────────────────┘
```

---

## File I/O & Storage

```
BLUETOOTH SERVICE
ble_scanner.py
  └─ Reads:
     ├─ .env (configuration)
     └─ Bluetooth data (BLE sensors)
     
  └─ Sends:
     └─ HTTP POST to Backend


BACKEND
server.js
  └─ Reads:
     ├─ .env (configuration)
     ├─ HTTP requests (from BLE service)
     └─ WebSocket connections (from frontend)
     
  └─ Writes:
     ├─ MongoDB (sensor readings)
     └─ WebSocket messages (to frontend)


FRONTEND
App.jsx / Pages / Components
  └─ Reads:
     ├─ HTTP responses (API calls)
     └─ WebSocket messages (real-time updates)
     
  └─ Sends:
     ├─ HTTP requests (GET, POST)
     └─ WebSocket connections


DATABASE
MongoDB (aquaponics collection)
  └─ Collections:
     ├─ sensorreadings    (main data)
     ├─ users             (authentication)
     ├─ thresholds        (alert thresholds)
     └─ schedules         (automation)
```

---

## Thread/Process Model

```
WINDOWS PROCESSES (3 Independent Services)

❶ Node.js Process (Terminal 1)
   └─ Runs: backend/server.js
   └─ Port: 5000
   └─ Function: Express server + WebSocket
   └─ Status: ✓ Must be running
   
❷ Node.js Process (Terminal 2)
   └─ Runs: frontend in dev mode
   └─ Port: 3000
   └─ Function: React development server
   └─ Status: ✓ Must be running
   
❸ Python Process (Terminal 3)
   └─ Runs: bluetooth_service/ble_scanner.py
   └─ Port: N/A (communicates via HTTP)
   └─ Function: BLE scanning & API calls
   └─ Status: ✓ Must be running OR
              ✓ simulator.js must run


MONGODB (Background Service)
   └─ Service name: MongoDB or mongod
   └─ Port: 27017
   └─ Function: Data persistence
   └─ Status: ✓ Must be running
```

---

## Timing & Latency

```
SENSOR UPDATE CYCLE (Total Time: ~1-2 seconds)

[00:00] BLE Sensor reads (local)
   │
   ├─ [00:01] ble_scanner.py gets value (Bluetooth)
   │
   ├─ [00:02] Service sends HTTP POST (network)
   │
   ├─ [00:03] Backend receives & validates (express)
   │
   ├─ [00:04] Backend saves to MongoDB (disk I/O)
   │
   ├─ [00:05] Backend broadcasts via WebSocket
   │
   ├─ [00:06] Frontend receives message
   │
   └─ [00:07] React updates UI & renders (browser)
   
Total: ~7ms to ~1500ms depending on:
• Bluetooth connection quality
• Network latency
• Database write speed
• Browser rendering


TYPICAL REFRESH RATE:
10 second interval
= New sensor data every 10 seconds
= Dashboard updates every 10 seconds
= Charts refresh every 10 seconds

USER PERCEPTION:
"System feels real-time" when interval < 15 seconds
"Noticeable lag" when interval > 30 seconds
```

---

This architecture supports:
✅ Real-time monitoring (WebSocket)
✅ Historical data (MongoDB)
✅ Multiple sensors (scalable)
✅ Alert thresholds (automatic)
✅ Future cloud deployment (easily portable)

**Everything runs locally.** Internet not required for normal operation! 🌱
