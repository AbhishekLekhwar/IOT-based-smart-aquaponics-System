# 🌱 ESP32 Aquaponics Sensor Module

## 📋 Overview

The ESP32 Sensor Module replaces the BLE Bluetooth service. It reads multiple water quality and environmental sensors via WiFi and transmits data to the backend server for real-time monitoring and alerts.

**Key Features:**
- ✅ Reads 5 simultaneous sensors (temperature, pH, humidity, water level)
- ✅ WiFi connectivity (802.11 b/g/n)
- ✅ Transmits data every 30 seconds
- ✅ Automatic threshold detection and alert generation
- ✅ Built-in error handling and WiFi reconnection logic
- ✅ Minimal power consumption (~80mA active, 2mA sleep)

---

## 📁 Files in This Directory

| File | Purpose |
|------|---------|
| [esp32_aquaponics.ino](./esp32_aquaponics.ino) | Main Arduino sketch - sensor reading & WiFi transmission |
| [ESP32_QUICK_START.md](./ESP32_QUICK_START.md) | 5-minute setup guide (START HERE) |
| [ESP32_SETUP.md](./ESP32_SETUP.md) | Comprehensive installation & calibration guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete system architecture diagrams |
| [ESP32_TROUBLESHOOTING.md](./ESP32_TROUBLESHOOTING.md) | Debugging common issues |
| [README.md](./README.md) | This file |

---

## 🚀 Quick Start

### New to ESP32?
1. Start with [ESP32_QUICK_START.md](./ESP32_QUICK_START.md) (5 minutes)
2. Then read [ESP32_SETUP.md](./ESP32_SETUP.md) for detailed steps

### Already familiar?
1. Wire sensors per [ESP32_SETUP.md - Part 1](./ESP32_SETUP.md#part-1-hardware-setup)
2. Copy `esp32_aquaponics.ino` to Arduino IDE
3. Edit lines 19-21 for WiFi credentials
4. Upload & verify serial monitor output

### Problems?
Check [ESP32_TROUBLESHOOTING.md](./ESP32_TROUBLESHOOTING.md)

---

## 🔧 Hardware Requirements

| Component | Details | Cost |
|-----------|---------|------|
| ESP32-WROOM-32 | Microcontroller with WiFi | $8-12 |
| DHT22 | Temperature + Humidity | $5-8 |
| pH Sensor Module | Water pH 0-14 scale | $15-25 |
| Water Level Sensor | Float or capacitive | $8-15 |
| DS18B20 or Thermistor | Water temperature | $2-5 |
| Resistors | 4.7kΩ, 10kΩ | <$1 |
| Breadboard + Wires | Prototyping | $5-10 |
| USB Cable | Micro-USB Type-B | $2-5 |
| **Total** | | **~$50-80** |

---

## 💻 Software Requirements

| Software | Purpose |
|----------|---------|
| Arduino IDE 1.8.13+ | Code editor and uploader |
| DHT Sensor Library | DHT22 communication |
| ArduinoJson | JSON payload formatting |
| USB Drivers (CP210x) | ESP32 communication |

See [ESP32_SETUP.md - Part 2](./ESP32_SETUP.md#part-2-arduino-ide-setup) for installation instructions.

---

## 📊 How It Works

```
1. ESP32 Initialization
   ├─ Setup WiFi connection
   ├─ Initialize sensors (DHT22, analog pins)
   └─ Ready to read

2. Sensor Reading Loop (every 10 seconds)
   ├─ Read DHT22 (room temp + humidity)
   ├─ Read analog sensors (pH, water level, water temp)
   └─ Buffer readings

3. Data Transmission (every 30 seconds)
   ├─ Calculate averages from 3 buffered readings
   ├─ Format JSON payload
   ├─ HTTP POST to backend /api/sensors/data
   ├─ Receive confirmation
   └─ Clear buffer for next cycle

4. Real-time Updates
   ├─ Backend validates data
   ├─ Checks against thresholds
   ├─ Broadcasts to frontend via WebSocket
   └─ Frontend updates dashboard in real-time
```

---

## 🌐 API Endpoint

**Endpoint:** `POST /api/sensors/data`

**Request Format:**
```json
{
  "deviceId": "esp32-aquaponics-01",
  "waterTemperature": 24.5,
  "roomTemperature": 22.1,
  "humidity": 55.3,
  "waterLevel": 65,
  "ph": 6.8
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "deviceId": "esp32-aquaponics-01",
    "waterTemperature": 24.5,
    "roomTemperature": 22.1,
    "humidity": 55.3,
    "waterLevel": 65,
    "ph": 6.8,
    "timestamp": "2024-04-17T15:32:10.000Z"
  }
}
```

---

## 📈 Typical Data Output

**Serial Monitor (115200 baud):**
```
╔════════════════════════════════════════════════════════════╗
║      🌱 ESP32 Aquaponics Sensor Module v1.0            ║
╚════════════════════════════════════════════════════════════╝

🔌 Starting WiFi connection...
.....
✓ WiFi connected!
IP: 192.168.1.105
Signal: -65 dBm

🌱 Initializing sensors...
✓ Sensors initialized

✓ Setup complete! Starting data collection...

🌡 Room Temp: 22.1°C | Humidity: 55.3%
📊 Reading #1 | Water: 24.5°C | Level: 65% | pH: 6.8

🌡 Room Temp: 22.1°C | Humidity: 55.3%
📊 Reading #2 | Water: 24.5°C | Level: 65% | pH: 6.8

🌡 Room Temp: 22.2°C | Humidity: 55.4%
📊 Reading #3 | Water: 24.5°C | Level: 65% | pH: 6.8

📤 Sending data to backend...
Payload: {"deviceId":"esp32-aquaponics-01","waterTemperature":24.5,"roomTemperature":22.1,"humidity":55.3,"waterLevel":65,"ph":6.8,"timestamp":45,"signalStrength":-65}
✓ Response code: 201
Response: {"success":true,"data":{...}}
```

---

## 🔌 Wiring Diagram

```
ESP32 Pinout
┌─────────────────────────────────────┐
│       GND  GND  3V3  EN              │
│ D35 (ADC) D34 D36(ADC) D39           │  ← Water Level, pH, Temp analog
│                                      │
│   GPIO4 → DHT22 Data (+ 4.7kΩ to 3V3)
│   3V3   → DHT22 Vcc
│   GND   → DHT22 GND
│                                      │
│ All sensors share common GND         │
│ All sensors use 3.3V (NOT 5V!)      │
└─────────────────────────────────────┘
```

**Detailed:** See [ESP32_SETUP.md - Part 1](./ESP32_SETUP.md#part-1-hardware-setup)

---

## ⚙️ Configuration Parameters

Edit these lines in `esp32_aquaponics.ino`:

```cpp
// WiFi Configuration (lines 19-21)
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* BACKEND_URL = "http://192.168.1.100:5000/api/sensors/data";
const char* DEVICE_ID = "esp32-aquaponics-01";

// Sensor Pins (lines 30-34)
#define DHT_PIN 4              // GPIO 4
#define PH_SENSOR_PIN 34       // GPIO 34 (ADC)
#define WATER_LEVEL_PIN 35     // GPIO 35 (ADC)
#define WATER_TEMP_PIN 36      // GPIO 36 (ADC)

// Timing (lines 49-50)
const unsigned long SENSOR_INTERVAL = 10000;  // Read every 10s
const unsigned long SEND_INTERVAL = 30000;    // Send every 30s
```

---

## 🧪 Testing & Verification

### Step 1: Serial Monitor
- Upload code → Open Serial Monitor (115200 baud)
- Should show WiFi connection and sensor readings
- Check for ✓ checkmarks (success indicators)

### Step 2: Backend Verification
```bash
# Test backend health:
curl http://192.168.1.100:5000/api/health

# Fetch latest sensor data:
curl http://192.168.1.100:5000/api/sensors/latest?deviceId=esp32-aquaponics-01
```

### Step 3: Frontend Dashboard
- Navigate to http://localhost:3000
- Dashboard page should show ESP32 sensor stream
- Values update every 30 seconds
- Alerts trigger if thresholds exceeded

---

## 🎯 Use Cases

### Single Aquaponics System
- 1x ESP32 for all sensors
- Device ID: `esp32-aquaponics-01`

### Multiple Aquaponics Beds
- Multiple ESP32s with unique IDs:
  - `esp32-bed-a` (Lettuce bed)
  - `esp32-bed-b` (Fish tank)
  - `esp32-bed-c` (Herb bed)
- Frontend displays all sensor streams
- Alerts per location

### Distributed Monitoring
- ESP32s in different rooms/greenhouses
- WiFi mesh network for coverage
- Centralized backend for all data

---

## 🔄 System Integration

```
┌──────────────┐
│   ESP32      │ ← Sensor readings every 10s
│  (This)      │ ← Sends data every 30s
└──────┬───────┘
       │ WiFi HTTP POST
       ↓
   Backend (Already running)
       ├─ Validates data
       ├─ Stores in MongoDB
       ├─ Broadcasts to WebSocket
       └─ Generates alerts
       │
       ├────────→ Frontend Dashboard (Updates in real-time)
       │
       ├────────→ Raspberry Pi (Camera continues working independently)
       │
       └────────→ (Future) Mobile App, External Services
```

---

## 📚 Documentation

- **Beginner:** [ESP32_QUICK_START.md](./ESP32_QUICK_START.md)
- **Learning:** [ESP32_SETUP.md](./ESP32_SETUP.md)
- **Reference:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Issues:** [ESP32_TROUBLESHOOTING.md](./ESP32_TROUBLESHOOTING.md)

---

## 🆘 Common Issues

**WiFi Won't Connect:**
- Verify SSID/password exact match
- Check radio signal strength
- Try 2.4GHz band specifically

**Sensors Read Garbage:**
- Verify correct GPIO pins
- Check pull-up resistor on DHT22
- Test with multimeter

**Backend Returns 400:**
- Verify JSON payload format in serial monitor
- Check deviceId field
- Ensure all required fields present

**See more:** [ESP32_TROUBLESHOOTING.md](./ESP32_TROUBLESHOOTING.md)

---

## 📝 Comparison: ESP32 vs Original BLE Service

| Feature | ESP32 | BLE Service |
|---------|-------|-------------|
| Setup | Flash once, run forever | Install Python, manage process |
| Connectivity | WiFi (100+ m range) | Bluetooth (50-100 m) |
| Power | 80mA active, 2mA sleep | Included with RPi |
| Cost | $8-12 | Free (if RPi exists) |
| Scalability | Easy (multiple units) | Complex (many devices) |
| Maintenance | Minimal | Monitor process |
| Latency | 100-500ms | 50-200ms |

**Verdict:** ESP32 is ideal for this project ✅

---

## 🚀 Next Steps

1. ✅ Flash ESP32 with `esp32_aquaponics.ino`
2. ✅ Verify serial monitor shows data
3. ✅ Check backend receives readings
4. ✅ View dashboard with real-time updates
5. 📷 Keep Raspberry Pi for camera
6. 📊 Set custom threshold alerts
7. 📱 (Future) Mobile app to view data

---

## 📞 Support

**Having issues?**
1. Check [ESP32_TROUBLESHOOTING.md](./ESP32_TROUBLESHOOTING.md) first
2. Compare your setup to [ESP32_SETUP.md](./ESP32_SETUP.md)
3. Verify backend is running: `npm start` in backend folder
4. Copy serial monitor output for debugging

---

## 📄 License

Aquaponics Project - Open Source

---

**Last Updated:** April 17, 2024  
**Version:** 1.0 (ESP32 + Raspberry Pi)  
**Status:** ✅ Production Ready
