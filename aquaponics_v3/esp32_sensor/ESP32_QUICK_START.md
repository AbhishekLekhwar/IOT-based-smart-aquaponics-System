# ⚡ ESP32 Quick Start (5 Minutes)

## TL;DR - Get Running Immediately

### 1. Hardware Assembly (2 min)

Connect to ESP32 DEVKIT:
- **DHT22 Pin 1** → 3V3
- **DHT22 Pin 2** → GPIO4 (add 4.7kΩ pullup to 3V3)
- **DHT22 Pin 4** → GND
- **pH Sensor** → GPIO34
- **Water Level** → GPIO35  
- **Temp Sensor** → GPIO36
- **All GND** → ESP32 GND

### 2. Arduino IDE Setup (2 min)

```bash
# In Preferences → Additional Board URLs, add:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Then: Tools → Board Manager → Install "ESP32" by Espressif

# Install libraries:
# Sketch → Include Library → Manage Libraries
# → Search and install:
#   - DHT sensor library (Adafruit)
#   - ArduinoJson
```

### 3. Code Configuration (1 min)

Open `esp32_aquaponics.ino` and change:
```cpp
const char* SSID = "YOUR_WIFI_NAME";
const char* PASSWORD = "YOUR_WIFI_PASS";
const char* BACKEND_URL = "http://YOUR_SERVER_IP:5000/api/sensors/data";
const char* DEVICE_ID = "esp32-aquaponics-01";
```

**Find YOUR_SERVER_IP:**
- Windows: Open Command Prompt, run `ipconfig` → look for "IPv4 Address"
- Mac/Linux: Open Terminal, run `hostname -I`
- Or check your router's connected devices list

### 4. Upload (Less than 1 min)

1. Connect ESP32 via USB
2. **Sketch → Upload** (Ctrl+U)
3. Wait for upload message
4. **Tools → Serial Monitor** (115200 baud)
5. Watch for WiFi connection and sensor data

Expected output:
```
✓ WiFi connected!
IP: 192.168.1.105

✓ Sensors initialized
✓ Setup complete!

📊 Reading #1 | Water: 24.5°C | Level: 65% | pH: 6.8
📤 Sending data to backend...
✓ Response code: 201
```

---

## Verify It Works

**Check Serial Monitor** (should show green checkmarks ✓)

**Check Backend Receipt:**
```bash
# Open terminal and run:
curl http://YOUR_SERVER_IP:5000/api/sensors/latest?deviceId=esp32-aquaponics-01

# Should return:
# {
#   "success": true,
#   "data": {
#     "deviceId": "esp32-aquaponics-01",
#     "waterTemperature": 24.5,
#     "humidity": 55.3,
#     ...
#   }
# }
```

**Check Dashboard:**
1. Open http://localhost:3000
2. Go to Dashboard page
3. Should show "esp32-aquaponics-01" sensor data updating every 30 seconds

---

## Pin Reference

| Function | GPIO | Notes |
|----------|------|-------|
| DHT22 Data | 4 | Add 4.7kΩ pullup |
| pH Sensor | 34 | Analog (ADC1) |
| Water Level | 35 | Analog (ADC1) |
| Water Temp | 36 | Analog (ADC1) |

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Board not found" | Install CP210x drivers, check USB cable |
| "WiFi not connecting" | Verify SSID/password in code, check WiFi range |
| "Sensor reads 0" | Check wiring, verify voltage with multimeter |
| "400 error from backend" | Make sure `deviceId` is correct in code |
| "No response from DHT22" | Add 4.7kΩ resistor, check pin number |

---

## Next: Full Setup

For detailed configuration, hardware calibration, and advanced features, see [ESP32_SETUP.md](./ESP32_SETUP.md)

---

## Architecture: ESP32 + Raspberry Pi

```
ESP32 (Sensors) + Raspberry Pi (Camera) → Same Backend

ESP32: Reads → water temp, pH, humidity, level
  ↓ HTTP (every 30s)
Backend REST API
  ↓ WebSocket
Frontend: Shows sensor + camera data

Raspberry Pi: Reads camera → captures images
  ↓ HTTP (every 5s)
Backend
  ↓
Frontend Camera Page
```

You now have a complete IoT aquaponics monitoring system! 🌱🎥
