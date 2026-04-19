# 🚀 Quick Start - 3 Terminal Launch

## Copy-Paste to Get Running (5 minutes)

---

## Terminal 1: Start Backend

```powershell
cd aquaponics_v3/backend
npm start
```

**Wait for:**
```
🌱 AquaMonitor Server → http://localhost:5000
🔌 WebSocket         → ws://localhost:5000/ws
```

✅ **Leave this running**

---

## Terminal 2: Start Frontend

```powershell
cd aquaponics_v3/frontend
npm start
```

**Wait for:**
```
Compiled successfully!
You can now view aquaponics in the browser.
```

✅ **Open http://localhost:3000** in browser

---

## Terminal 3: Pick One Option

### 🎲 OPTION A: Fast Demo (Simulator - No sensors needed)

```powershell
cd aquaponics_v3/backend
node simulator.js
```

**You'll see:**
```
[10:30:00] Sending reading...
  ✓ Response: 201

[10:30:05] Sending reading...
  ✓ Response: 201
```

✅ **Check dashboard - data should appear!**

---

### 🔵 OPTION B: Use Real Bluetooth Sensors

```powershell
cd aquaponics_v3/bluetooth_service

# First time only:
pip install -r requirements.txt

# Find your sensors:
python ble_scanner.py --scan
```

**Then edit `ble_scanner.py`** - update `SENSOR_HANDLERS` with your sensor names

**Then run:**
```powershell
python ble_scanner.py
```

✅ **Check dashboard - data should appear!**

---

## 📊 What You'll See

### Browser (http://localhost:3000)

**Login:**
```
Email: admin@aquamonitor.local
Password: aqua1234
```

**Dashboard:**
```
═══════════════════════════════════
    🌱 AQUAPONICS DASHBOARD
═══════════════════════════════════

✅ Connected  |  Last: 2s ago

💧 Water Temperature
   24.5 °C ✓

🌡️  Room Temperature
   26.0 °C ✓

💨 Humidity
   65 % ✓

🌊 Water Level
   85 % ✓

🧪 pH
   7.2 ✓

═══════════════════════════════════
```

**Real-time charts updating below!**

---

## 🔍 Verify Everything Works

### ✅ Check 1: Backend Health
```powershell
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "wsClients": 1,
  "uptime": 120
}
```

### ✅ Check 2: Get Latest Data
```powershell
curl http://localhost:5000/api/sensors/latest
```

Should return sensor JSON with real data.

### ✅ Check 3: Browser Console Check
Open browser → Press F12 → Console tab

Should show:
```
✓ Connected to AquaMonitor
✓ WebSocket message received
```

---

## 🎯 Expected Data Flow Timeline

```
[00:00] You start services
↓
[00:05] Backend running ✓
↓
[00:10] Frontend running & connected ✓
↓
[00:15] Simulator/BLE service running ✓
↓
[00:20] First sensor data received ✓
↓
[00:21] Dashboard shows live data ✓
↓
... data updates every 5-10 seconds ...
```

---

## ⚡ Common First-Run Issues

### Dashboard is blank / no data showing

**Fix:**
1. Check Terminal 1 (backend) is running
2. Check Terminal 2 (frontend) shows "Compiled successfully"
3. Check Terminal 3 shows "Data sent to backend" messages
4. Refresh browser (F5)

### Simulator showing 201 but dashboard empty

**Fix:**
1. Check browser console (F12) for errors
2. Type in console: 
   ```javascript
   fetch('http://localhost:5000/api/sensors/latest').then(r => r.json()).then(console.log)
   ```
3. If data shows in console but not dashboard → frontend WebSocket issue

### MongoDB error / database not found

**Fix:**
```powershell
# Make sure MongoDB is running
# Check: Services > MongoDB should be running
# Or: mongod --dbpath C:\path\to\data
```

---

## 📱 Terminal Tab Names (For Reference)

```
┌─────────────────────────────────────────────────────┐
│ TAB 1: BACKEND    │ TAB 2: FRONTEND   │ TAB 3: SENSORS │
│ :5000            │ :3000             │ Bluetooth/Sim  │
│ npm start        │ npm start         │ python/node    │
└─────────────────────────────────────────────────────┘
```

Deploy all 3 tabs visible so you can see data flowing!

---

## 🔄 Data Update Cycle

```
Sensor (BLE or Simulator)
    ↓ every 5-10 seconds
Python/Node captures data
    ↓
HTTP POST to /api/sensors/data
    ↓ (validated & stored)
MongoDB saves reading
    ↓
Backend broadcasts via WebSocket
    ↓
Frontend receives message
    ↓
React updates state → Dashboard refreshes
    ↓
You see live numbers changing! 📊
```

---

## ✨ You'll Know It's Working When

- ✅ Dashboard shows live temperature changing
- ✅ Every ~10 seconds, "Last update: just now" resets
- ✅ Charts show real-time line updates
- ✅ Terminal 3 shows "✅ Data sent to backend"
- ✅ No console errors in browser (F12)

---

## 🎉 Mission Accomplished!

You have a **fully functioning real-time aquaponics monitoring system**:
- Real sensors (or simulator) feeding data
- Backend API processing it
- Frontend displaying live updates
- All 3 services running together

**Now you can:**
- Add more sensors
- Customize thresholds
- Export data
- Set up alerts
- Deploy to cloud

---

## 📝 Copy-Paste Commands Summary

```powershell
# Terminal 1 - Backend
cd aquaponics_v3/backend
npm start

# Terminal 2 - Frontend  
cd aquaponics_v3/frontend
npm start

# Terminal 3 - Simulator (EASIEST FOR DEMO)
cd aquaponics_v3/backend
node simulator.js

# OR Terminal 3 - Real Bluetooth
cd aquaponics_v3/bluetooth_service
pip install -r requirements.txt
python ble_scanner.py --scan  # Find sensors first
python ble_scanner.py         # Run service
```

**Open browser:** http://localhost:3000

**Login:** admin@aquamonitor.local / aqua1234

**Enjoy! 🌱**
