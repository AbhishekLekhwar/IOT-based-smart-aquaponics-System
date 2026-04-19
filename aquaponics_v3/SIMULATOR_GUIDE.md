# 🌱 Data Simulator Guide

## Overview

The **simulator.js** generates 120 realistic sensor readings across 6 different scenarios to populate all graphs, logs, and history in your dashboard.

---

## Quick Start

### Prerequisites
✅ Backend running: `cd backend && npm start`
✅ Frontend running: `cd frontend && npm start`

### Run the Simulator

```bash
cd aquaponics_v3
node simulator.js
```

**Expected Duration:** 15-30 seconds

---

## What Gets Generated

The simulator creates data across **6 scenarios** with **20 readings each**:

| Scenario | Readings | Purpose |
|----------|----------|---------|
| 📊 **Normal Operation** | 20 | Baseline stable data |
| 🔴 **High Temperature** | 20 | Warning alerts (26-29°C) |
| 🟠 **Low pH** | 20 | Critical alerts (5.8-6.4) |
| 🟡 **Low Water Level** | 20 | Warning alerts (30-45%) |
| 🔶 **High Humidity** | 20 | Humidity warnings (75-95%) |
| 🟢 **System Recovery** | 20 | Return to normal operation |

---

## What You'll See in Dashboard

### 1. **Dashboard Page**
- ✅ Real-time sensor cards updating
- ✅ Live graphs for temperature trends
- ✅ pH level charts
- ✅ Humidity trends
- ✅ Water level gauges

### 2. **History Page**
- ✅ 24-hour data trends
- ✅ Multiple graph views:
  - Temperature over time
  - pH variations
  - Humidity patterns
  - Water level changes
- ✅ Date range filtering
- ✅ Export functionality

### 3. **Alerts Page**
- ✅ All alert logs with timestamps
- ✅ Alert severity levels:
  - 🟢 Info
  - 🟡 Warning
  - 🔴 Critical
- ✅ Alert messages and details
- ✅ Searchable alert history

### 4. **System Health Page**
- ✅ Summary statistics
- ✅ Average readings
- ✅ Min/Max values
- ✅ System uptime
- ✅ Active alerts count

---

## Data Structure

Each sensor reading includes:

```javascript
{
  deviceId: "aquaponics-unit-01",
  waterTemperature: 24.2,      // °C (0-100)
  roomTemperature: 23.5,       // °C (-10-60)
  humidity: 58.3,              // % (0-100)
  waterLevel: 72.1,            // % (0-100)
  ph: 6.85,                    // pH (0-14)
  timestamp: "2024-04-19T10:30:00Z"
}
```

---

## Timeline of Generated Data

All data is timestamped starting from **24 hours ago**, with:
- **1 minute intervals** between readings
- **Total span:** ~2 hours of simulated data
- **Time compression:** Simulates realistic daily patterns

This allows you to see:
- ✅ Historical trends
- ✅ Time-series graphs
- ✅ Daily patterns
- ✅ Alert escalation/de-escalation

---

## Advanced Usage

### Run Multiple Times
You can run the simulator multiple times to accumulate more historical data:

```bash
# First run
node simulator.js

# Wait 30 seconds
# Second run
node simulator.js
```

Each run adds 120 new data points.

### Run with Manual Sensor Data
Combine with the original demo:

```bash
# Terminal 1: Run simulator
node simulator.js

# Terminal 2 (after simulator completes): Run continuous demo
node demo_sensor_data.js
```

---

## Troubleshooting

### "Error: listen EADDRINUSE"
Backend is already running. Kill existing processes:
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
killall node
```

### "Error: connect ECONNREFUSED"
Backend is not running. Start it first:
```bash
cd backend
npm start
```

### Frontend not showing updates
Check if WebSocket is connected:
- Open browser DevTools (F12)
- Check Network tab for `/ws` connection
- Ensure backend is running

---

## What Each Scenario Shows

### Scenario 1: Normal Operation
```
Water Temp: 23.5-24.5°C ✓
pH: 6.7-6.9 ✓
Humidity: 50-65% ✓
Water Level: 68-75% ✓
→ Shows stable baseline operation
```

### Scenario 2: High Temperature
```
Water Temp: 26-29°C ⚠️
Humidity rises to 70-75%
→ Shows warning alerts on dashboard
→ Charts show temperature spike
```

### Scenario 3: Low pH (Critical)
```
pH: 5.8-6.4 🔴
Water Temp: 23-25°C
→ Shows critical alert
→ Requires attention on alerts page
```

### Scenario 4: Low Water Level
```
Water Level: 30-45% 🔴
Humidity rises (evaporation)
→ Shows critical water level warning
→ Action required indicator
```

### Scenario 5: High Humidity
```
Humidity: 75-95% ⚠️
Water Temp: 24°C
→ Shows humidity warning
→ Multiple warnings if combined with other issues
```

### Scenario 6: Recovery
```
Temperature gradually cooling: 29°C → 26°C
All other sensors stabilizing
→ Shows system recovery process
→ Alerts clearing
→ Return to normal operation
```

---

## Expected Dashboard Output

After running the simulator, you should see:

```
✓ Scenario 1: Normal Operation - 20 readings
✓ Scenario 2: High Temperature Warning - 20 readings
✓ Scenario 3: Low pH Critical - 20 readings
✓ Scenario 4: Low Water Level Warning - 20 readings
✓ Scenario 5: High Humidity Alert - 20 readings
✓ Scenario 6: System Recovery - 20 readings

╔══════════════════════════════════════════════════════════════════╗
║                  ✨ SIMULATION COMPLETE ✨                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Readings Sent:  120
║  Failed Requests:      0
║  Success Rate:         100.0%
╚══════════════════════════════════════════════════════════════════╝
```

---

## Tips & Tricks

1. **View Live Updates**
   - Open dashboard at http://localhost:3000
   - Keep simulator running in separate terminal
   - Watch real-time updates

2. **Test Alerts**
   - Check alerts page during simulator
   - Verify alert severity colors
   - Test alert filtering

3. **Export Data**
   - After simulator completes
   - Go to History page
   - Click Export to download CSV

4. **Monitor Performance**
   - Open DevTools → Performance tab
   - Run simulator
   - Check if dashboard updates smoothly

---

## Next Steps

After testing with simulator:
- ✅ Configure real sensor hardware
- ✅ Update API keys (Twilio, camera services)
- ✅ Set custom alert thresholds
- ✅ Deploy to production

