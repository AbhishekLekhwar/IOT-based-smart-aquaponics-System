# 🎬 Complete Demo Startup Guide

## 🎯 5-Minute Setup Overview

```
Step 1: Open 3 PowerShell terminals side-by-side
        ↓
Step 2: Terminal 1 → npm start (Backend)
        ↓
Step 3: Terminal 2 → npm start (Frontend) 
        ↓
Step 4: Terminal 3 → node simulator.js OR python ble_scanner.py
        ↓
Step 5: Open http://localhost:3000 in browser
        ↓
Step 6: Login & watch data appear
        ↓
✅ DONE! Real-time monitoring active!
```

---

## 📋 Pre-Launch Checklist

- [ ] Windows with Bluetooth (built-in or USB adapter)
- [ ] Node.js installed → `node --version` (should show v16+)
- [ ] Python 3.8+ → `python --version`
- [ ] MongoDB running → OR `mongod` in another terminal
- [ ] All 3 folders ready: `backend/`, `frontend/`, `bluetooth_service/`

**Missing something?**
- Node.js: https://nodejs.org/
- Python: https://www.python.org/
- MongoDB: https://www.mongodb.com/try/download/community

---

## ⏱️ Exact Steps (Copy & Paste)

### 1️⃣ Terminal 1 - Backend Server (The Brain)

**Open PowerShell → navigate to project:**
```powershell
cd C:\Users\abhil\Desktop\aquaponics_project\aquaponics_v3\backend
```

**Install once (first time only):**
```powershell
npm install
```

**Start the server:**
```powershell
npm start
```

**⏳ Wait 5 seconds, then you should see:**
```
> aquaponics-backend@1.0.0 start
> node server.js

🌱 AquaMonitor Server → http://localhost:5000
🔌 WebSocket         → ws://localhost:5000/ws
🔐 Auth              → POST /api/auth/login

👤 Default admin: admin@aquamonitor.local / aqua1234
```

✅ **Backend is alive! Keep this terminal open.**

**If you see errors:**
- "Cannot find module" → Run `npm install` first
- "Port 5000 already in use" → Another app using port 5000, close it
- "MongoDB connection error" → Start MongoDB: `mongod`

---

### 2️⃣ Terminal 2 - Frontend Server (The Dashboard)

**Open NEW PowerShell:**
```powershell
cd C:\Users\abhil\Desktop\aquaponics_project\aquaponics_v3\frontend
```

**Install once:**
```powershell
npm install
```

**Start the dev server:**
```powershell
npm start
```

**⏳ Wait 10 seconds, you should see:**
```
Compiled successfully!

You can now view aquaponics in the browser.

  On Your Network:  http://localhost:3000

Note that the development build is not optimized.
```

✅ **Frontend is ready!** A browser tab should open automatically.

**If it doesn't open:** Go to http://localhost:3000 manually

**You'll see:**
```
┌────────────────────────────────────┐
│  🔐 AquaMonitor - Login            │
│                                    │
│  Email                             │
│  [ admin@aquamonitor.local      ]  │
│                                    │
│  Password                          │
│  [ ••••••••                     ]  │
│                                    │
│          [ LOGIN ]                 │
│                                    │
└────────────────────────────────────┘
```

**Click LOGIN** (password is: `aqua1234`)

⏳ **You'll see a blank dashboard** - this is normal, we haven't sent sensor data yet!

---

### 3️⃣ Terminal 3 - Sensor Data (The Source)

Open NEW PowerShell and choose ONE:

#### Option A: Simulator (EASIEST - Generates Fake Data)

```powershell
cd C:\Users\abhil\Desktop\aquaponics_project\aquaponics_v3\backend
node simulator.js
```

**You should see:**
```
🤖 Aquaponics Sensor Simulator
Sending data to: http://localhost:5000/api/sensors/data
Interval: 5 seconds

[10:30:00] Sending reading...
  ✓ Response: 201
  
[10:30:05] Sending reading...
  ✓ Response: 201
  
[10:30:10] Sending reading...
  ✓ Response: 201
```

✅ **Simulator is sending data!**

**Go back to browser tab** → You should now see the dashboard filling with data!

---

#### Option B: Bluetooth Sensors (Real Hardware)

**Setup (first time only):**
```powershell
cd C:\Users\abhil\Desktop\aquaponics_project\aquaponics_v3\bluetooth_service
pip install -r requirements.txt
```

**Find your sensors:**
```powershell
python ble_scanner.py --scan
```

**Wait for results:**
```
📡 Scanning for BLE devices...

  • HM-10_TEMPERATURE      AA:BB:CC:DD:EE:FF
  • BLE_SENSOR_PH          11:22:33:44:55:66
  • DHT_BLE_SENSOR         99:88:77:66:55:44
```

**Edit the ble_scanner.py file:** Update `SENSOR_HANDLERS` with YOUR sensor names (from above)

**Then run:**
```powershell
python ble_scanner.py
```

**You should see:**
```
🚀 Starting continuous monitoring...

[10:30:45] Scanning sensors...
  🔍 Scanning for: HM-10_TEMPERATURE
  ✓ Found: HM-10_TEMPERATURE (AA:BB:CC:DD:EE:FF)
  🔗 Connected to HM-10_TEMPERATURE
  ✓ Temperature: 24.5°C
  ✅ Data sent to backend

[10:30:50] Scanning sensors...
  🔍 Scanning for: BLE_SENSOR_PH
  ✓ Found: BLE_SENSOR_PH (11:22:33:44:55:66)
  🔗 Connected to BLE_SENSOR_PH
  ✓ pH: 7.2
  ✅ Data sent to backend
```

✅ **Bluetooth service is sending data!**

---

## 📊 Watch the Dashboard Update

### Browser: http://localhost:3000

**Before sensor data starts:**
```
⚠️ Dashboard loading... (waiting for data)
```

**After Terminal 3 starts sending data (5-10 seconds):**

```
═══════════════════════════════════════════════════════════
                    🌱 Dashboard
═══════════════════════════════════════════════════════════

Status: ✅ Connected  |  Last Update: Just Now

┌─────────────────────────────────────────────────────────┐
│  💧 Water Temperature          🌡️ Room Temperature       │
│                                                           │
│      24.5 °C ✓                     26.0 °C ✓             │
│     (Range: 18-28°C)              (Range: 15-35°C)     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  💨 Humidity                   🌊 Water Level            │
│                                                           │
│      65 %                          85 %                 │
│    (Range: 40-80%)                (Min: 20%)            │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  🧪 pH Level                                             │
│                                                           │
│      7.2                                                 │
│    (Range: 6.0-8.0)                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘

📈 CHARTS:

Temperature Chart          │   pH Chart
(Last 24 hours)           │   (Last 24 hours)
                         │
24─────╱╲──               │   7.5──────╱╲─
      ╱  ╲                │      ╱  ╲  
23──╱      ╲──            │ ──╱   ╱  ╲──
   ╱        ╲             │╱         
22─────────  │ 7.0─────────── 
   └────────┘│   └─────────
   Time ──→  │   Time ──→
```

**Data updates every ~5-10 seconds** (depending on your simulator/sensor interval)

---

## 🔍 Visual System Overview

### Data Journey

```
PHYSICAL WORLD
  🌡️  Temperature Sensor ──┐
  🧪 pH Sensor          ├─→ 📡 Bluetooth Radio
  💨 Humidity Sensor    ├─→
  🌊 Water Sensor       ┘
  
           │ Wireless Bluetooth
           ↓
  
  PYTHON / NODE.js SERVICE
  ┌─────────────────────────────┐
  │ ble_scanner.py              │
  │ or simulator.js             │
  │                             │
  │ • Reads sensor data         │
  │ • Converts to JSON          │
  │ • Formats: {               │
  │   waterTemp: 24.5,         │
  │   pH: 7.2,                 │
  │   humidity: 65,            │
  │   ...                      │
  │ }                          │
  └────────────┬────────────────┘
               │ HTTP POST
               │ /api/sensors/data
               ↓
  
  NODE.js BACKEND (PORT 5000)
  ┌─────────────────────────────┐
  │ • Receives JSON             │
  │ • Validates data            │
  │ • Saves to MongoDB          │
  │ • Checks thresholds         │
  │ • Broadcasts via WebSocket  │
  └────────────┬────────────────┘
               │ WebSocket
               │ "SENSOR_UPDATE"
               ↓
  
  REACT FRONTEND (PORT 3000)
  ┌─────────────────────────────┐
  │ • Receives update           │
  │ • Updates React state       │
  │ • Re-renders UI             │
  │ • Shows numbers change      │
  │ • Animates charts           │
  └────────────┬────────────────┘
               │ Updates
               ↓
  
  🎉 YOUR BROWSER
  ┌─────────────────────────────┐
  │  💧 Water Temperature       │
  │     24.5 °C  (live!)       │
  │                             │
  │  ✅ Connected               │
  │  ✳️  Last: 2 seconds ago    │
  └─────────────────────────────┘
```

---

## ✅ Success Checklist

You're doing it right when you see:

- [ ] **Terminal 1** shows: "🌱 AquaMonitor Server → http://localhost:5000"
- [ ] **Terminal 2** shows: "Compiled successfully!"
- [ ] **Terminal 3** shows: "✅ Data sent to backend" (repeating)
- [ ] **Browser** shows dashboard with live numbers
- [ ] **Dashboard** updates every ~5-10 seconds
- [ ] **No red errors** in browser console (F12)

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module npm" | Install Node.js from nodejs.org |
| "Port 5000 already in use" | Another app using it. Kill it or change PORT in .env |
| "MongoDB connection error" | Start MongoDB: `mongod` in another terminal |
| "No data on dashboard" | Check Terminal 3 - is it sending "Data sent to backend"? |
| "404 localhost:3000" | Wait 30 seconds for frontend to compile, then refresh |
| "Frontend blank/error" | Open browser console (F12) - check for errors |
| "Bluetooth not found" | Make sure BLE sensor is powered on and pairing mode active |

---

## 📱 Terminal Layout (Recommended)

Position your 3 terminals like this:

```
┌────────────────────────────────────────────────────────────┐
│ TERMINAL 1: BACKEND        │ TERMINAL 2: FRONTEND         │
│ npm start                  │ npm start                    │
│                            │                             │
│ 🌱 AquaMonitor Server      │ Compiled successfully!      │
│ → http://localhost:5000    │ → http://localhost:3000     │
│                            │                             │
│ □ Monitoring connections  │ □ Hot reload enabled        │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ TERMINAL 3: SENSORS                                        │
│ node simulator.js OR python ble_scanner.py                │
│                                                            │
│ ✅ Data sent to backend                                   │
│ ✅ Data sent to backend                                   │
│ ✅ Data sent to backend                                   │
│                                                            │
│ (Updates every 5-10 seconds)                             │
└────────────────────────────────────────────────────────────┘
```

This way you can **watch data flow** in all 3 places at once!

---

## 🎬 Real-Time Demo Sequence

**T+0:00** → You run `npm start` in Terminal 1
**T+0:05** → Backend fully started
**T+0:10** → You run `npm start` in Terminal 2
**T+0:20** → Frontend starts compiling
**T+0:30** → Frontend shows login page
**T+0:35** → You login with admin credentials
**T+0:40** → Dashboard appears (empty)
**T+0:45** → You start Terminal 3 (simulator.js or ble_scanner.py)
**T+0:50** → Terminal 3 shows "Data sent to backend"
**T+1:00** → Dashboard updates with first reading! 🎉
**T+1:05** → Dashboard updates with second reading 📊
**T+1:10** → Dashboard updates with third reading 📈
...
**Ongoing** → Every 5-10 seconds, new data arrives 🔄

---

## 🎓 What's Happening Behind the Scenes

```
Browser                 Backend API           Sensor Service
   │                         │                      │
   ├─ Requests data ────────→ │                      │
   │                         │ ← ← ← Polling ← ← ←─┤
   │                         │   {temp:24.5}        │
   │ ← ← ← WebSocket ← ← ← ←┤                      │
   │  {SENSOR_UPDATE}        │                      │
   │                         │                      │
   Updates dashboard    Broadcasts        Sends data
   Shows numbers       to all clients     every 5-10s
```

---

## 🏁 Your First Full Cycle

After everything is running, you'll see this sequence:

```
[Terminal 3]     "✅ Data sent to backend"
        ↓
[Terminal 1]     "POST /api/sensors/data 201"  
        ↓
[MongoDB]        Data stored in "SensorReading" collection
        ↓
[Terminal 1]     "Broadcasting to 1 WebSocket client"
        ↓
[Terminal 2]     Frontend receives message
        ↓
[Browser]        React updates state
        ↓
[Dashboard]      You see live numbers change! 🎉
```

This cycle repeats every 5-10 seconds = **LIVE MONITORING ACTIVE**

---

## 🎉 Congratulations!

When you see data updating on the dashboard, you have successfully:

✅ Set up Bluetooth sensor integration
✅ Started a real-time backend API
✅ Connected a React frontend
✅ Received live data through the full stack
✅ Built a complete IoT monitoring system

**Now you can:**
- Monitor aquaponics in real-time
- View historical data
- Set up alerts
- Export readings
- Add more sensors
- Deploy to cloud

---

## 📞 Getting Help

1. **Check browser console** (F12)
2. **Check Terminal 1 & 2 for errors**
3. **Check `SIMPLE_TROUBLESHOOTING.md`** in this folder
4. **Verify each service** is running independently
5. **Make sure MongoDB** is running

---

**Ready? Let's go! Start with Terminal 1.** 🚀
