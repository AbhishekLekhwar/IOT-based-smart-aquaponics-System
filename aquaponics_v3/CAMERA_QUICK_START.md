# 🎥 Camera Quick Start (5 mins)

Get Raspberry Pi camera streaming to dashboard in 5 minutes.

## ⚡ Quick Setup

### Terminal 1: Backend (Already Running)
```bash
cd aquaponics_v3/backend
npm start
```

### Terminal 2: Frontend (Already Running)
```bash
cd aquaponics_v3/frontend  
npm start
```

### Terminal 3: Raspberry Pi Camera Service

**On your Raspberry Pi:**

```bash
# Navigate to camera service
cd ~/aquaponics_project/aquaponics_v3/raspberry_pi_camera

# Setup Python environment (first time only)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure (edit .env with your backend IP)
nano .env

# Start service
python camera_service.py
```

### 🎬 Expected Output

```
🎥 Raspberry Pi Camera Service Starting...
   Backend URL: http://localhost:5000
   PI Name: aquaponics-pi-1
   Resolution: 640x480
   Config: {...}
✓ Camera initialized: 640x480
🎥 Starting periodic snapshots (every 5s)
✓ Snapshot sent: 45230 bytes
✓ Snapshot sent: 44890 bytes
```

## ✅ Verify It Works

### Terminal 1: Check API
```bash
curl http://localhost:5000/api/camera/list
```

**Expected**: Camera appears with latest image

### Browser: Check Dashboard
```
http://localhost:3000
```

**Scroll down** → See **Camera Panel** with live image

## 🎛️ Configuration

Edit `raspberry_pi_camera/.env`:

```env
# Your backend server (if remote)
BACKEND_URL=http://192.168.1.100:5000

# Unique name for this Pi
PI_NAME=aquaponics-pi-1

# How often to capture (seconds)
CAMERA_INTERVAL=5

# Resolution 
CAMERA_RESOLUTION=640x480

# Image quality (1-100)
CAMERA_QUALITY=85
```

## 📊 Storage Stats

**Default Settings (5s interval, 640x480, quality 85):**
- Per day: ~50MB
- Per week: ~350MB  
- Per month: ~1.5GB

**To Reduce Storage:**
```env
CAMERA_INTERVAL=10        # Every 10 seconds
CAMERA_RESOLUTION=320x240 # Lower resolution
CAMERA_QUALITY=70         # Lower quality
```

## 🐛 Troubleshooting

### Camera Not Found
```bash
# Enable camera in raspi-config
sudo raspi-config
# → Interfacing Options → Camera → Enable → Reboot
```

### Can't Connect to Backend
```bash
# Update .env with correct IP
nano raspberry_pi_camera/.env
# Set BACKEND_URL=http://<your-backend-ip>:5000

# Test connection
ping <your-backend-ip>
curl http://<your-backend-ip>:5000/api/health
```

### No Image in Dashboard
1. Verify camera service is running
2. Check dashboard for "No cameras connected" message
3. Refresh browser: F5
4. Check browser console for errors: F12

### Storage Getting Full
```bash
# Delete old images (keep last 5)
curl -X DELETE "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=5"
```

## 💡 Tips

- **Demo Mode**: Service runs on PC without camera, shows placeholder images
- **Auto-Refresh**: Dashboard auto-refreshes every 5 seconds
- **History**: Click "📜 History" to see all captured images
- **Multiple Cameras**: Create multiple camera services with different PI_NAME values

## Next Steps

✅ Service running and sending images  
✅ Images appear in dashboard  
→ **Now configure for your specific use case:**
- Fine-tune resolution/quality
- Set up automatic cleanup tasks
- Add pan-tilt camera control
- Enable infrared for night monitoring

**Full guide**: [CAMERA_SETUP.md](./CAMERA_SETUP.md)  
**API Reference**: [CAMERA_SETUP.md#api-reference](./CAMERA_SETUP.md#api-reference)
