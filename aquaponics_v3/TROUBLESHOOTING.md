# 🐛 Common Issues & Quick Fixes

## ❌ Problem: "npm command not found"

**Cause:** Node.js not installed

**Fix:**
1. Download from: https://nodejs.org/
2. Run installer
3. Restart PowerShell
4. Type: `node --version` (should show v16+)

---

## ❌ Problem: "Port 5000 already in use"

**Cause:** Another app is using backend port

**Option 1 - Kill the process:**
```powershell
Get-Process node | Stop-Process -Force
# Then try npm start again
```

**Option 2 - Use different port:**
```powershell
# In backend/.env, change:
PORT=5001
# Then start: npm start
```

---

## ❌ Problem: "MongoDB connection error"

**Cause:** MongoDB not running

**Fix:**
```powershell
# Option 1: Start MongoDB if installed as service
# Services > MongoDB > Right-click > Start

# Option 2: Run mongod directly
mongod
# Run in a separate terminal, leave it open
```

---

## ❌ Problem: Dashboard is blank (no data)

**Checklist:**

```powershell
# 1. Is backend running?
curl http://localhost:5000/api/health
# Should return: {"status":"ok",...}

# 2. Is frontend running?
# Check browser: http://localhost:3000
# Should show dashboard (even if blank)

# 3. Is sensor service running?
# Terminal 3 should show "✅ Data sent to backend"
# If not - start simulator.js or ble_scanner.py
```

**If still blank:**
- Open browser console (F12)
- Look for WebSocket errors
- Refresh page (F5)

---

## ❌ Problem: "No devices found" (Bluetooth)

**Cause:** Sensors not detected

**Fix:**

1. **Check Bluetooth is enabled:**
   ```powershell
   # Windows Settings > Devices > Bluetooth
   # Toggle should be ON
   ```

2. **Check sensors are powered on**
   - Look for LED indicators
   - Try restarting sensor

3. **Check pairing mode**
   - Many sensors need to be in "advertising" mode
   - Check sensor documentation
   - Usually hold button 3-5 seconds

4. **Check Windows sees them:**
   ```powershell
   # Settings > Devices > Bluetooth > Devices
   # Your sensor should appear there
   ```

5. **Retry scan:**
   ```powershell
   python ble_scanner.py --scan
   ```

---

## ❌ Problem: Simulator sends data but dashboard empty

**Cause:** Data isn't reaching frontend (WebSocket issue)

**Debug in browser console (F12):**

```javascript
// Check if WebSocket is connected
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

**You should see:**
```json
{
  "status": "ok",
  "wsClients": 1,    // ← Should be 1 (your browser)
  "uptime": 120
}
```

**If `wsClients: 0` your browser isn't connected:**
- Close & reopen dashboard
- Check browser console for errors
- Verify frontend is connecting to http://localhost:5000

---

## ❌ Problem: "Connection refused" error

**Cause:** Frontend can't reach backend

**Fix:**

1. **Verify backend URL in frontend code**
   - Check: `frontend/src/utils/api.js`
   - Should have: `http://localhost:5000`

2. **Check both are running:**
   ```powershell
   curl http://localhost:5000/api/health
   # Should work if backend running
   ```

3. **If on different machines:**
   - Change `localhost` to backend's IP
   - Example: `http://192.168.1.100:5000`

---

## ❌ Problem: Browser shows "PORT 3000 already in use"

**Cause:** Frontend port taken

**Fix:**
```powershell
# Kill Node process
Get-Process node | Stop-Process -Force

# Or use different port
# In frontend/.env:
PORT=3001
# Then: npm start
```

---

## ❌ Problem: "ModuleNotFoundError: No module named 'bleak'"

**Cause:** Python dependencies not installed

**Fix:**
```powershell
cd bluetooth_service
pip install -r requirements.txt
# Or manually:
pip install bleak aiohttp python-dotenv
```

---

## ⚠️ Warning: Data arriving but with errors

**Backend shows errors like:**
```
Sensor ingest error: Missing required fields
```

**Fix:** Check your sensor provides all required data:

Required fields:
```json
{
  "deviceId": "aquaponics-unit-01",
  "waterTemperature": 24.5,     // Required
  "roomTemperature": 26.0,       // Required
  "humidity": 65.0,              // Required
  "waterLevel": 75.0,            // Required
  "ph": 7.2                      // Optional
}
```

If using Bluetooth service, check the parser function provides all fields.

---

## ⚠️ Warning: WebSocket connection drops

**You see:** "Lost connection" message on dashboard

**Cause:** Service restarts or connection timeout

**Fix:**
1. Check Terminal 1 (backend) didn't crash
2. Look for error messages
3. Restart backend if needed:
   ```powershell
   # In Terminal 1:
   Ctrl+C
   npm start
   ```

---

## 🆘 Complete Restart (Nuclear Option)

If everything breaks, restart everything:

```powershell
# Terminal 1
Ctrl+C
cd backend
npm start

# Terminal 2
Ctrl+C
cd frontend
npm start

# Terminal 3
Ctrl+C
cd backend
node simulator.js
# OR
cd bluetooth_service
python ble_scanner.py
```

---

## ✅ Verification Commands

### Check Backend Health
```powershell
curl http://localhost:5000/api/health
```

Should show:
```json
{
  "status": "ok",
  "uptime": 450,
  "wsClients": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Latest Sensor Data
```powershell
curl http://localhost:5000/api/sensors/latest
```

Should show sensor readings.

### Check MongoDB Data
```powershell
mongosh
> use aquaponics
> db.sensorreadings.findOne()
# Should show a sensor document
```

### Browser Console Check
Press F12 in browser and run:
```javascript
// Should show no errors
console.log("✅ Browser console ready")

// Check WebSocket status
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 📞 Still Stuck?

**Gather this info, then ask for help:**

1. **What did you try?**
   - "Started npm start in backend"
   - "Ran python ble_scanner.py"
   - etc.

2. **What do you see?**
   - Copy exact error from terminal
   - Example: "Cannot find module 'express'"

3. **What should happen?**
   - "Dashboard should show data"
   - "Backend should start on port 5000"

4. **Terminal output:**
   - Copy exact terminal text (red errors)
   - Screenshot if easier

5. **Browser console:**
   - F12 → Console tab
   - Any red errors?

---

## 🎯 The 3 Service Tests

**Run these one at a time to isolate issues:**

### Test 1: Backend Alone
```powershell
cd backend
npm start
# Wait 5 seconds
# Should show: "🌱 AquaMonitor Server → http://localhost:5000"
# ✅ Works = Backend good
```

### Test 2: Frontend Alone
```powershell
cd frontend
npm start
# Wait 30 seconds
# Browser should open to http://localhost:3000
# Should show login page
# ✅ Works = Frontend good
```

### Test 3: Simulator Alone
```powershell
cd backend
node simulator.js
# Should show: "✓ Response: 201"
# ✅ Works = Simulator + Backend communication good
```

**If all 3 pass individually but fail together:**
- It's likely a port conflict
- Or a WebSocket communication issue
- Check browser console (F12)

---

## 🚨 Error Messages Decoded

| Error | Means | Fix |
|-------|-------|-----|
| "Cannot find module" | Missing npm package | Run `npm install` |
| "Port already in use" | Another app on port | Kill process or change port |
| "MongoDB connection" | DB not running | Start `mongod` |
| "ENOTFOUND localhost" | Network issue | Check firewall/localhost allowed |
| "WebSocket: close" | Connection lost | Restart backend |
| "401 Unauthorized" | Login failed | Check credentials |
| "404 Not Found" | Wrong URL/endpoint | Check API path |
| "500 Server Error" | Backend crashed | Check logs, restart |

---

## 💡 Pro Tips

1. **Keep 3 terminals visible** while debugging
2. **Read the full error** before searching
3. **Restart services in order:** Backend → Frontend → Sensors
4. **MongoDB must be running** before backend starts
5. **Use `curl` to test API** independent of frontend
6. **Check browser console** (F12) for frontend-specific errors
7. **Copy exact error messages** when asking for help

---

**Still stuck? The error message usually tells you exactly what's wrong!** 🔍
