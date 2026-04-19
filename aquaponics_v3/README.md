# 🌱 Smart Aquaponics Monitoring System

A full-stack IoT monitoring and control dashboard for aquaponics setups. Built with React, Node.js, Express, MongoDB, and WebSockets.

---

## 🏗️ Architecture

```
Arduino/RPi ──HTTP POST──► Node.js + Express ──► MongoDB
                                 │
                            WebSocket broadcast
                                 │
                           React Dashboard
```

---

## ⚙️ Tech Stack

| Layer       | Technology            | Purpose                          |
|-------------|----------------------|----------------------------------|
| Frontend    | React + Tailwind CSS | Real-time dashboard UI           |
| Backend     | Node.js + Express    | REST API + WebSocket server      |
| Database    | MongoDB + Mongoose   | Time-series IoT sensor storage   |
| Real-time   | WebSocket (ws)       | Push live data to dashboard      |
| Charts      | Recharts             | Sensor trend visualization       |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. MongoDB

```bash
# macOS
brew install mongodb-community && brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Or use MongoDB Atlas (update MONGO_URI in backend/.env)
```

### 2. Backend

```bash
cd backend
npm install
npm run dev          # Starts server on :5000

# In a second terminal — simulates Arduino sensor data:
node simulator.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm start            # Opens on http://localhost:3000
```

---

## 📡 API Reference

### Sensors
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/sensors/data`         | Ingest sensor reading          |
| GET    | `/api/sensors/latest`       | Latest reading                 |
| GET    | `/api/sensors/history`      | Historical data (range filter) |
| GET    | `/api/sensors/stats`        | Aggregated min/max/avg         |
| GET    | `/api/sensors/alerts`       | Alert history                  |

### Devices
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/api/devices/state`        | All device states              |
| PUT    | `/api/devices/control`      | Toggle a device ON/OFF         |
| PUT    | `/api/devices/automode`     | Enable/disable automation      |

### WebSocket
Connect to `ws://localhost:5000/ws` to receive:
- `SENSOR_UPDATE` — new sensor reading received
- `DEVICE_UPDATE` — device state changed
- `CONNECTED` — connection established

---

## 🔌 Arduino Integration

Send HTTP POST to `/api/sensors/data` every few seconds:

```cpp
// Arduino (with ESP8266/ESP32 WiFi)
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

void sendSensorData(float waterTemp, float roomTemp, float humidity, float waterLevel) {
  HTTPClient http;
  http.begin("http://YOUR_SERVER_IP:5000/api/sensors/data");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["deviceId"] = "aquaponics-unit-01";
  doc["waterTemperature"] = waterTemp;
  doc["roomTemperature"] = roomTemp;
  doc["humidity"] = humidity;
  doc["waterLevel"] = waterLevel;
  doc["ph"] = 7.2; // from pH sensor

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  http.end();
}
```

### Recommended Sensors
| Parameter         | Sensor           | Interface |
|-------------------|-----------------|-----------|
| Water Temperature | DS18B20          | OneWire   |
| Room Temp+Humid   | DHT22 / SHT31   | Digital   |
| Water Level       | HC-SR04 Ultrasonic | Digital |
| pH                | Analog pH Probe  | Analog    |

---

## 🎛️ Dashboard Features

- **Live sensor cards** — color-coded status (OK / Warning / Critical)
- **Mini sparklines** — trend at a glance on each card
- **Real-time charts** — temperature, humidity, water level over time
- **Water tank gauge** — visual tank fill visualization
- **Statistics panel** — avg/min/max per time range (1h, 6h, 24h, 7d)
- **Alert history** — all threshold violations logged
- **Device controls** — toggle Buzzer, LED, Water Pump, Aerator, Feeder
- **Auto mode** — automated control based on sensor values
- **WebSocket live push** — zero polling, instant updates
- **Toast notifications** — real-time alerts in UI

---

## 📁 Project Structure

```
aquaponics/
├── backend/
│   ├── config/db.js
│   ├── models/
│   │   ├── SensorReading.js
│   │   └── DeviceState.js
│   ├── controllers/
│   │   ├── sensorController.js
│   │   └── deviceController.js
│   ├── routes/
│   │   ├── sensorRoutes.js
│   │   └── deviceRoutes.js
│   ├── middleware/alertChecker.js
│   ├── server.js
│   ├── simulator.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/AppContext.jsx
    │   ├── hooks/useWebSocket.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── formatters.js
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── SensorCard.jsx
    │   │   │   ├── StatsPanel.jsx
    │   │   │   ├── AlertBanner.jsx
    │   │   │   ├── WaterLevelGauge.jsx
    │   │   │   └── NotificationStack.jsx
    │   │   ├── charts/
    │   │   │   ├── TemperatureChart.jsx
    │   │   │   └── WaterLevelChart.jsx
    │   │   └── controls/
    │   │       ├── DeviceToggle.jsx
    │   │       └── ControlPanel.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   └── AlertsPage.jsx
    │   ├── App.jsx
    │   └── index.js
    └── tailwind.config.js
```

---

## 🌍 Deployment

### Backend (Railway / Render / VPS)
```bash
# Set env vars:
MONGO_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-dashboard.com
```

### Frontend (Vercel / Netlify)
```bash
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_WS_URL=wss://your-backend.com/ws
npm run build
```
