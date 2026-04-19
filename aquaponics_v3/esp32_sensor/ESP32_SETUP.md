# 🌱 ESP32 Aquaponics Sensor Setup Guide

## Overview
This guide walks you through setting up an ESP32 microcontroller to read aquaponics sensors and send data to your backend server. The ESP32 replaces the BLE sensor bridge, eliminating the need for Python Bluetooth scanning.

**Architecture:**
```
ESP32 (WiFi + Sensors) ──HTTP POST──> Backend (Node.js)
                                           ↓
                                      MongoDB
                                           ↓
Frontend (React) <──────REST API──────┘
                    ↓ WebSocket
                    └──> Real-time Updates

Raspberry Pi (WiFi Camera) ──HTTP POST──> Backend
                                          Camera Storage
```

---

## Part 1: Hardware Setup

### Components Required

| Component | Quantity | Purpose | Notes |
|-----------|----------|---------|-------|
| ESP32-WROOM-32 | 1 | Main microcontroller | Dual-core, WiFi, 520KB RAM |
| DHT22 | 1 | Temperature + Humidity | Range: -40 to +80°C, 0-100% RH |
| pH Sensor Module | 1 | Water pH measurement | 0-14 scale, analog output |
| Water Level Sensor | 1 | Tank fill level | Float or capacitive type |
| Temperature Sensor | 1 | Water temperature | DS18B20 or thermistor |
| 4.7kΩ Resistor | 1 | DHT22 pullup | Required for data line |
| 10kΩ Resistor | 1 | pH sensor divider | Voltage scaling |
| USB Cable | 1 | Programming & power | Micro-USB Type-B |
| Breadboard | 1 | Prototyping | 400+ tie points |
| Jumper Wires | 20+ | Connections | Male-to-male and female-to-male |

### Wiring Diagram

```
ESP32 Pinout (DEVKIT v1)
┌─────────────────────────────────────┐
│  3V3 ──→ DHT22 VCC                 │
│  GND ──→ Common Ground              │
│  GPIO4 ──→ DHT22 Data (with 4.7kΩ)│
│  GPIO34 ──→ pH Sensor Analog        │
│  GPIO35 ──→ Water Level Analog      │
│  GPIO36 ──→ Water Temp Sensor       │
│  GND ──→ All sensor grounds        │
└─────────────────────────────────────┘
```

**DHT22 Connection:**
```
DHT22 Module
├─ Vcc (Red) ──→ ESP32 3V3
├─ Out (Yellow) ──→ ESP32 GPIO4 + 4.7kΩ to 3V3
├─ NC (not used)
└─ GND (Black) ──→ ESP32 GND
```

**Analog Sensors (pH, Water Level, Temp):**
```
Each analog sensor:
├─ Vcc ──→ ESP32 3V3
├─ Signal ──→ ESP32 GPIO (34, 35, 36)
└─ GND ──→ ESP32 GND
```

---

## Part 2: Arduino IDE Setup

### Step 1: Install Arduino IDE
1. Download from [arduino.cc](https://www.arduino.cc/en/software)
2. Install for your OS (Windows/Mac/Linux)

### Step 2: Add ESP32 Board Support

1. Open Arduino IDE → **Preferences** (Windows: File → Preferences)
2. In "Additional Board Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools → Board Manager**
4. Search for "ESP32" by Espressif
5. Install version **2.0.11 or later**

### Step 3: Install Required Libraries

1. **Sketch → Include Library → Manage Libraries**

Install these libraries:
- **DHT sensor library** by Adafruit (v1.4.4)
- **ArduinoJson** by Benoit Blanchon (v7.0.4)
- **AsyncHTTPClient** or use built-in **HTTPClient**

Or paste in Library Manager search box:
```
Adafruit DHT
ArduinoJson
```

### Step 4: Configure Board & Port

1. **Tools → Board → esp32 → ESP32 Dev Module**
2. **Tools → Flash Mode → QIO**
3. **Tools → Flash Frequency → 80MHz**
4. **Tools → Upload Speed → 921600**
5. **Tools → Port → COMX** (where your ESP32 is connected)

**On Windows:** Check Device Manager to find COM port
**On Mac/Linux:** Run `ls /dev/tty*` to find port (usually `/dev/ttyUSB0` or `/dev/cu.usbserial-*`)

---

## Part 3: Code Configuration

### 1. Edit WiFi Credentials

Open `esp32_aquaponics.ino` and find these lines (~lines 19-21):

```cpp
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* BACKEND_URL = "http://192.168.1.100:5000/api/sensors/data";
const char* DEVICE_ID = "esp32-aquaponics-01";
```

**Fill in:**
- `YOUR_SSID` → Your WiFi network name
- `YOUR_PASSWORD` → Your WiFi password
- `192.168.1.100` → Your backend server IP (find from `ipconfig` on Windows)
- `esp32-aquaponics-01` → Unique identifier for this ESP32

### 2. Verify Pin Configuration

Check that GPIO assignments match your wiring (lines 30-34):

```cpp
#define DHT_PIN 4              // Match your DHT+pin
#define PH_SENSOR_PIN 34       // Match your pH pin
#define WATER_LEVEL_PIN 35     // Match your level pin
#define WATER_TEMP_PIN 36      // Match your temp pin
```

### 3. Adjust Sensor Calibration (Optional)

**For pH Sensor:** Lines 152-158
```cpp
float readPH() {
  int rawValue = analogRead(PH_SENSOR_PIN);
  // pH = 7 + (voltage - 2.5V) / 0.059V per pH unit
  float voltage = rawValue * (3.3 / 4095.0);
  float ph = 7.0 + (voltage - 2.5) / 0.059;  // ← Adjust if needed
  ph = constrain(ph, 0, 14);
  return ph;
}
```

**For Water Temperature:** Lines 130-136
```cpp
float readWaterTemperature() {
  int rawValue = analogRead(WATER_TEMP_PIN);
  float voltage = rawValue * (3.3 / 4095.0);
  float temp = (voltage - 0.5) * 100;  // ← Calibrate based on your sensor
  temp = constrain(temp, -10, 60);
  return temp;
}
```

---

## Part 4: Uploading & Testing

### Step 1: Compile & Upload

1. Connect ESP32 to computer via USB
2. In Arduino IDE: **Sketch → Upload** (Ctrl+U)
3. Wait for "Leaving... Hard resetting via RTS pin..." message

**Troubleshooting Upload Issues:**
- **Port not found:** Install [CP210x drivers](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
- **Communication error:** Try holding BOOT button while uploading
- **Permission denied (Linux/Mac):** Run `sudo usermod -a -G dialout $USER`

### Step 2: Monitor Serial Output

1. **Tools → Serial Monitor** (Ctrl+Shift+M)
2. Set baud rate to **115200**
3. You should see:

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

📊 Reading #1 | Water: 24.5°C | Level: 65% | pH: 6.8
📊 Reading #2 | Water: 24.5°C | Level: 65% | pH: 6.8
📊 Reading #3 | Water: 24.5°C | Level: 65% | pH: 6.8
📤 Sending data to backend...
Payload: {"deviceId":"esp32-aquaponics-01","waterTemperature":24.5,"roomTemperature":22.1,"humidity":55.3,"waterLevel":65,"ph":6.8,"timestamp":45,"signalStrength":-65}
✓ Response code: 201
Response: {"success":true,"data":{...}}
```

### Step 3: Verify Backend Reception

1. Open Chrome DevTools (F12) on your frontend
2. Go to **Networks** tab
3. Refresh dashboard - you should see `/api/sensors/latest` requests with ESP32 data

Or check directly with curl:
```bash
curl http://192.168.1.100:5000/api/sensors/latest?deviceId=esp32-aquaponics-01
```

Expected response:
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

## Part 5: Advanced Configuration

### Adjust Read & Send Intervals

**In esp32_aquaponics.ino (lines 49-50):**

```cpp
const unsigned long SENSOR_INTERVAL = 10000;  // Read every 10 seconds
const unsigned long SEND_INTERVAL = 30000;    // Send every 30 seconds
```

**Recommended values:**
- **Sensor Interval:** 5-15 seconds (frequency of local reads)
- **Send Interval:** 30-60 seconds (frequency of backend updates)
- **WiFi:** More frequent = higher power consumption

### WiFi Power Saving

Add to `setup()` for improved power efficiency:
```cpp
WiFi.setTxPower(WIFI_POWER_8dBm);  // Reduce transmit power
```

### Deep Sleep (Battery Operation)

Replace main loop with:
```cpp
void loop() {
  collectSensorData();
  sendSensorData();
  
  // Sleep for 5 minutes
  esp_sleep_enable_timer_wakeup(5 * 60 * 1000000);  // microseconds
  esp_light_sleep_start();
}
```

---

## Part 6: System Architecture

### Data Flow

```
┌─────────────┐
│   ESP32     │ (WiFi + Sensors)
│  ├─ DHT22   │ → Room Temp, Humidity
│  ├─ pH      │ → Water pH
│  ├─ Level   │ → Water Level
│  └─ Temp    │ → Water Temperature
└──────┬──────┘
       │ HTTP POST /api/sensors/data
       │ JSON: {deviceId, temps, pH, level}
       ↓
┌─────────────────────────────────┐
│   Backend (Node.js/Express)     │
│  ├─ Receives sensor data        │
│  ├─ Validates measurements      │
│  ├─ Checks thresholds           │
│  ├─ Stores in MongoDB           │
│  └─ Broadcasts via WebSocket    │
└──────┬──────────────────────────┘
       │
    ┌──┴──┐
    ↓     ↓
┌────┐  ┌──────────────┐
│ DB │  │ WebSocket    │
└────┘  └──────┬───────┘
              │
              ↓
        ┌────────────────────┐
        │ Frontend (React)    │
        │ └─ Dashboard        │
        │ └─ Camera Page      │
        │ └─ Alerts           │
        └────────────────────┘
```

### Multiple ESP32s

To run multiple sensors, simply change `DEVICE_ID`:

**ESP32 #1 (Aquaponics Bed A)**
```cpp
const char* DEVICE_ID = "esp32-bed-a";
```

**ESP32 #2 (Aquaponics Bed B)**
```cpp
const char* DEVICE_ID = "esp32-bed-b";
```

Frontend will automatically display both as separate sensor streams.

---

## Part 7: Troubleshooting

| Issue | Solution |
|-------|----------|
| WiFi won't connect | Check SSID/password, WiFi range, reboot router |
| Sensors read 0 or garbage | Verify wiring, check pin numbers, test with multimeter |
| Backend returns 400 error | Verify `deviceId`, check JSON format in Serial Monitor |
| Data doesn't appear in dashboard | Ensure backend is running, check firewall, verify IP address |
| Frequent disconnects | Use 5GHz if possible, reduce send frequency, improve antenna placement |
| ESP32 reboots randomly | Power supply too weak (use 2A+), increase deep sleep time |
| DHT22 won't initialize | Add 4.7kΩ pullup resistor, ensure 3.3V not 5V |

---

## Part 8: Comparison: ESP32 vs BLE Python Service

| Feature | ESP32 | BLE Python |
|---------|-------|-----------|
| **Setup** | Flash once, run forever | Install Python, manage process |
| **Power** | ~80mA average | N/A (RPi powered) |
| **Connectivity** | WiFi 802.11b/g/n | Bluetooth 5.0 |
| **Range** | 100+ meters | 50-100 meters |
| **Cost** | $8-12 | Included (if using RPi) |
| **Maintenance** | Minimal | Monitor process, restart OS |
| **Scalability** | Multiple ESP32s easily | Multiple devices complex |
| **Latency** | 100-500ms | 50-200ms |
| **Dependencies** | None (standalone) | Python 3.8+, bleak, aiohttp |

**Recommendation:** ESP32 is ideal for this project - simpler, more reliable, and lower overhead.

---

## Part 9: Next Steps

1. ✅ Flash ESP32 with sketch
2. ✅ Verify serial monitor output
3. ✅ Check backend receives data
4. ✅ Verify dashboard shows ESP32 sensor stream
5. 📷 Continue using Raspberry Pi for camera
6. 🔄 (Optional) Deploy Python BLE service to archive/ folder
7. 📊 Set up alerts based on ESP32 sensor thresholds

---

**Questions or issues?** Check the [ESP32 Troubleshooting Guide](./ESP32_TROUBLESHOOTING.md) or visit [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/).
