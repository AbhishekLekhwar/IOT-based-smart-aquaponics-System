# 🔧 ESP32 Troubleshooting Guide

## Power & Connection Issues

### Issue: ESP32 Won't Program ("Board Not Found")

**Symptoms:**
- Arduino IDE shows "Port greyed out"
- Error: "Failed to open serial port"
- "Device not recognized" in Device Manager

**Solutions:**

1. **Install USB Drivers** (Most Common)
   - Download CP210x drivers: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - Windows: Download and run installer
   - Mac: Install .zip file and reboot
   - Linux: Usually pre-installed

2. **Check USB Cable**
   - Use data cable, not charging-only cable
   - Try different USB port (avoid USB 3.0 if available)
   - Test cable with another device

3. **Manual Upload Mode**
   - While uploading, press and hold **BOOT** button
   - Release when "Writing" starts
   - (Not needed on most dev boards with auto-reset circuit)

4. **Reset Board**
   - Press **RESET** button on board
   - Or short EN and GND pins briefly

---

### Issue: "Leaving... Hard resetting via RTS pin" Then Fails

**Symptoms:**
- Upload seems to work but board won't run new code
- Serial monitor shows garbage text

**Solutions:**

1. **Check Baud Rate**
   - Serial Monitor must be **115200**
   - Code uses `Serial.begin(115200);`

2. **Try Different Upload Parameters**
   ```
   Tools → Upload Speed → 115200 (try 230400 if not working)
   Tools → Flash Mode → DIO
   Tools → Flash Frequency → 40MHz (instead of 80MHz)
   ```

3. **Erase Flash Memory**
   ```
   Tools → Erase All Flash Before Sketch Upload → ON
   Upload again
   ```

4. **Use Lower Speed**
   - Set Upload Speed to 115200 (instead of 921600)
   - More reliable on problematic USB setups

---

## WiFi Connection Issues

### Issue: "WiFi not connected" - Stuck at Connection Screen

**Symptoms:**
- Serial monitor shows: `🔌 Starting WiFi connection... . . . . . . . .` (dots continue)
- WiFi never connects after 30+ seconds

**Solutions:**

1. **Verify WiFi Credentials**
   ```cpp
   const char* SSID = "YOUR_SSID";       // Exact match (case-sensitive)
   const char* PASSWORD = "YOUR_PASSWORD"; // Must be correct
   ```
   - Count characters: `"home wifi"` is different from `"homeWifi"`
   - No spaces unless WiFi name actually has spaces

2. **Check WiFi Signal**
   - Bring ESP32 closer to router
   - Remove obstacles (walls, metal)
   - Check if other devices can connect

3. **Restart Router**
   - Power off router for 30 seconds
   - Power ESP32 after router boots

4. **Use Open WiFi Temporarily**
   - If possible, test with open network (no password)
   - Helps isolate password issues
   ```cpp
   const char* SSID = "OpenNetwork";
   const char* PASSWORD = "";  // Empty
   ```

5. **Try 2.4GHz Only**
   - Disable 5GHz band on router (or force 2.4GHz in settings)
   - ESP32 often struggles with 5GHz or band switching

6. **Debug WiFi Status**
   ```cpp
   // Add to loop():
   if (WiFi.status() != WL_CONNECTED) {
     Serial.print("WiFi Status: ");
     Serial.println(WiFi.status()); // 3=connected, 1=connecting, etc.
   }
   ```

---

### Issue: WiFi Connects, Then Disconnects After Seconds

**Symptoms:**
- Serial: `✓ WiFi connected!` but then shortly after: `✗ WiFi not connected`
- Happens in a loop

**Solutions:**

1. **Improve Power Supply**
   - Use 2A+ power supply (not 500mA)
   - WiFi transmit draws high current
   - Weak power → brownout → reboot

2. **Reduce WiFi Transmit Power**
   ```cpp
   WiFi.setTxPower(WIFI_POWER_8dBm);  // Add to setup()
   ```

3. **Set Fixed IP** (if available)
   ```cpp
   IPAddress local_IP(192, 168, 1, 105);
   IPAddress gateway(192, 168, 1, 1);
   IPAddress subnet(255, 255, 255, 0);
   WiFi.config(local_IP, gateway, subnet);
   WiFi.begin(SSID, PASSWORD);
   ```

4. **Disable WiFi Sleep** (temporary)
   ```cpp
   WiFi.setSleep(false);  // Allow WiFi to go to sleep mode (false = never sleep)
   ```

---

## Sensor Reading Issues

### Issue: DHT22 Reads 0 or "nan" (Not a Number)

**Symptoms:**
- Serial shows: `✗ DHT22 read failed`
- Values: `🌡 Room Temp: nan°C | Humidity: nan%`

**Solutions:**

1. **Add Pull-up Resistor**
   - DHT22 Pin 2 (Data) needs **4.7kΩ resistor** to 3.3V
   - This is required; won't work without it
   - Check: multimeter between pin 2 and GND should read ~2.2V when idle

2. **Check Wiring**
   - DHT22 Pin 1 (Vcc) → ESP32 3V3 (NOT 5V)
   - DHT22 Pin 2 (Data) → ESP32 GPIO4 (with resistor)
   - DHT22 Pin 4 (GND) → ESP32 GND
   - Pin 3 (NC) - not connected

3. **Verify Pin Number in Code**
   ```cpp
   #define DHT_PIN 4  // Must match actual wiring
   ```

4. **Test DHT Library**
   ```cpp
   // Simple test in loop():
   float h = dht.readHumidity();
   float t = dht.readTemperature();
   if (isnan(h) || isnan(t)) {
     Serial.println("Failed to read from DHT sensor!");
   } else {
     Serial.print("Humidity: ");
     Serial.print(h);
     Serial.print("%  Temperature: ");
     Serial.print(t);
     Serial.println("C");
   }
   ```

5. **Replace If Defective**
   - DHT22 sensors occasionally fail
   - If new sensor works without changes, old was faulty

---

### Issue: pH Sensor Reads Constant Value (Always 7.0)

**Symptoms:**
- pH value never changes, always 7.0
- Or always reads 0 or 14

**Solutions:**

1. **Check Analog Pin**
   - Verify GPIO34, 35, 36 are ADC-capable (`analogRead()` compatible)
   - DON'T use pins 39, 35, 34 for other purposes (they're ADC only)

2. **Verify Voltage Divider**
   - pH probe outputs 0-5V but ESP32 accepts 0-3.3V max
   - Need voltage divider: `Vout = Vin × R2/(R1+R2)`
   - For 5V → 3.3V: Use 10kΩ to GND and 6.8kΩ to Vin
   - Test with multimeter: probe output voltage

3. **Recalibrate pH Formula**
   ```cpp
   float readPH() {
     int rawValue = analogRead(PH_SENSOR_PIN);
     float voltage = rawValue * (3.3 / 4095.0);
     
     // Debug - print raw values
     Serial.print("Raw ADC: ");
     Serial.print(rawValue);
     Serial.print(" | Voltage: ");
     Serial.println(voltage);
     
     // Then adjust formula based on your sensor
     float ph = 7.0 + (voltage - 2.5) / 0.059;
     return constrain(ph, 0, 14);
   }
   ```

4. **Test Without Probe**
   - Disconnect probe, set pin to known voltage (e.g., GND = 0V)
   - If it reads correctly: probe issue
   - If still wrong: cable/wiring issue

---

### Issue: Water Level Always 0% or 100%

**Symptoms:**
- Water level sensor stuck at min or max
- Doesn't respond to actual water level changes

**Solutions:**

1. **Test Sensor**
   - Manually check float sensor resistance with multimeter
   - Should vary smoothly between empty and full
   - If constant: sensor may be stuck

2. **Verify Analog Range**
   ```cpp
   // Debug in loop():
   int rawValue = analogRead(WATER_LEVEL_PIN);
   Serial.print("Raw level ADC: ");
   Serial.println(rawValue);  // Should vary 0-4095
   ```
   - Submerge float completely → should read near 4095
   - Remove float → should read near 0
   - If not: probe connection issue

3. **Recalibrate Mapping**
   ```cpp
   float readWaterLevel() {
     int rawValue = analogRead(WATER_LEVEL_PIN);
     
     // Adjust these values based on actual min/max readings
     int minReading = 200;   // What sensor reads when empty
     int maxReading = 3800;  // What sensor reads when full
     
     float level = constrain(map(rawValue, minReading, maxReading, 0, 100), 0, 100);
     return level;
   }
   ```

---

## Backend Communication Issues

### Issue: Backend Returns 400 "Missing required sensor fields"

**Symptoms:**
- Serial shows: `✓ Response code: 400`
- Or: `✗ Error: HTTP/1.1 400`

**Solutions:**

1. **Check JSON Format**
   - Verify all required fields are sent:
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
   - All numerical values (not strings)

2. **Debug Payload**
   - Check serial output: `Payload: {....}`
   - Copy exact JSON and validate with https://jsonlint.com/

3. **Verify No NaN Values**
   ```cpp
   // Before sending:
   if (isnan(waterTemp) || isnan(roomTemp) || 
       isnan(humidity) || isnan(waterLevel)) {
     Serial.println("✗ Invalid sensor values detected!");
     return;  // Don't send
   }
   ```

---

### Issue: Backend Returns 500 or No Response

**Symptoms:**
- Serial shows nothing or: `✗ Error: Connection refused`
- Or: `✓ Response code: 500`

**Solutions:**

1. **Verify Backend URL**
   ```cpp
   const char* BACKEND_URL = "http://192.168.1.100:5000/api/sensors/data";
   ```
   - IP address: Check with `ipconfig` on PC
   - Port: Confirm backend running on 5000 (`npm start` output)
   - Path: Exact case match: `/api/sensors/data` (not `/API/`)

2. **Test URL with Curl**
   ```bash
   # From PC command prompt:
   curl -X GET http://192.168.1.100:5000/api/health
   # Should return: {"status":"ok",...}
   ```

3. **Check Backend Running**
   - Terminal shows: `✓ MongoDB connected`
   - Terminal shows: `🌱 AquaMonitor Server → http://localhost:5000`

4. **Check Network Connection**
   - ESP32 and PC on same WiFi?
   - Ping from PC: `ping 192.168.1.105` (ESP32 IP)
   - Ping from PC terminal to itself: `ping 192.168.1.100`

5. **Check Firewall**
   - Windows Firewall might block port 5000
   - Temporarily disable: Settings → Privacy & Security → Firewall
   - Or add exception for node.exe

---

## Memory & Stability Issues

### Issue: ESP32 Reboots Randomly or "Guru Meditation Error"

**Symptoms:**
- Serial shows garbled text then restarts
- Error: `Guru Meditation Error: Core  panic'ed (Stack overflow)`

**Solutions:**

1. **Increase Stack Size** (rare, but try first)
   ```cpp
   // At top of code:
   #define LOW_MEMORY
   ```

2. **Reduce Memory Usage**
   - Remove debug Serial.println() calls
   - Use smaller buffer sizes
   - Check for memory leaks in loop

3. **Improve Power Supply**
   - ESP32 needs consistent 3.3V with 300mA+ capacity
   - Brownout triggers watchdog reset
   - Switch to 2A power supply

4. **Disable WiFi Temporarily**
   - Comment out WiFi code to isolate issue
   - If board is stable: WiFi-related
   - If still crashes: sensor or code issue

---

## Performance Issues

### Issue: Data Sends Very Slowly (30+ seconds late)

**Symptoms:**
- Serial shows data collected
- But backend receives it minutes later
- Or data appears sporadic

**Solutions:**

1. **Reduce Send Size**
   - Check JSON payload size
   - Remove unnecessary fields
   - Compress if possible

2. **Increase WiFi Signal**
   - Move closer to router
   - Reduce distance from AP

3. **Optimize HTTP Request**
   ```cpp
   http.setConnectTimeout(5000);  // Already in code
   http.setTimeout(5000);          // Already in code
   
   // Try reducing read interval:
   const unsigned long SENSOR_INTERVAL = 5000;  // Was 10000
   ```

---

## Testing Checklist

✓ **Before Troubleshooting:**
- [ ] Run `Tools → Get Board Info` → See ESP32 responds
- [ ] Check Serial Monitor baud is **115200**
- [ ] Verify all sensor wires connected to correct pins
- [ ] Multimeter tests: 3.3V, GND continuity, resistor ohms

✓ **WiFi Testing:**
- [ ] Test with open WiFi network first
- [ ] Verify SSID/password exact match
- [ ] Ping router IP from ESP32 (add to code temporarily)
- [ ] Check router DHCP pool has free IPs

✓ **Sensor Testing:**
- [ ] DHT22: Read should vary when breathing on sensor
- [ ] pH: Voltage should change 0.06V per pH unit
- [ ] Level: Float should move freely, resistance varies
- [ ] Temp: Should match room temperature approximately

✓ **Backend Testing:**
- [ ] `curl http://192.168.1.100:5000/api/health`
- [ ] Check MongoDB is running
- [ ] Watch backend terminal for request logging

✓ **Frontend Testing:**
- [ ] Dashboard loads at http://localhost:3000
- [ ] Can see GPS coordinates in Chrome DevTools
- [ ] WebSocket shows connecting

---

## Getting More Help

1. **Check Serial Output First** - Copy exact error message
2. **Document What You've Tried** - Helps narrow down issue
3. **Search Arduino Forums** - Most issues already solved (GitHub Issues, Arduino Create forums)
4. **ESP32 Official Docs** - https://docs.espressif.com/projects/esp-idf/en/latest/

---

**Last Updated:** April 17, 2024
**Version:** 1.0
