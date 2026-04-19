# 🎬 Camera System Demo Walkthrough

Complete demonstration of the Raspberry Pi camera integration working end-to-end.

## 📹 Demo Scenario

**Setup**: 3 terminals running simultaneously showing real-time data flow:
- Terminal 1: Backend server
- Terminal 2: Frontend dashboard  
- Terminal 3: Camera service (demo mode)

---

## 🚀 Step 1: Start Backend

**Terminal 1:**
```bash
cd ~/aquaponics_v3/backend
npm start
```

**Expected Output:**
```
> backend@1.0.0 start
> node server.js

✓ MongoDB connected
👤 Default admin: admin@aquamonitor.local / aqua1234
🎯 Server running on http://localhost:5000
🔌 WebSocket server running
```

**Verify Health:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 45,
  "wsClients": 0,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🎨 Step 2: Start Frontend

**Terminal 2:**
```bash
cd ~/aquaponics_v3/frontend
npm start
```

**Expected Output:**
```
> frontend@1.0.0 start
> react-scripts start

Compiled successfully!

Local:         http://localhost:3000
On Your Network: http://192.168.x.x:3000
```

**Open Browser:**
```
http://localhost:3000
```

You should see:
- Dashboard with sensor cards
- Temperature, pH, humidity sensors
- Control panel
- (Scroll down to find Camera Panel - currently shows: "📡 No cameras connected")

---

## 📷 Step 3: Start Camera Service (Demo Mode)

**Terminal 3:**
```bash
cd ~/aquaponics_v3/raspberry_pi_camera
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python camera_service.py
```

**Expected Output (Demo Mode - No Camera Hardware):**

```
🎥 Raspberry Pi Camera Service Starting...
   Backend URL: http://localhost:5000
   PI Name: aquaponics-pi-1
   Resolution: 640x480
   Config: {
     "width": 640,
     "height": 480,
     "quality": 85,
     "interval": 5,
     "pi_name": "aquaponics-pi-1",
     "enable_video": true
   }
⚠️  PiCamera2 not available - using demo mode
✓ Running in demo mode (no actual camera)
✓ Camera initialized: 640x480
🎥 Starting periodic snapshots (every 5s)
✓ Snapshot sent: 45230 bytes
✓ Snapshot sent: 45890 bytes
✓ Snapshot sent: 44560 bytes
(continues every 5 seconds...)
```

---

## 🎥 Step 4: Watch Dashboard Update

**In Browser (http://localhost:3000):**

Scroll to **Camera Panel** section at bottom of dashboard.

### Before Service Starts
```
🎥 Raspberry Pi Cameras
[Refresh]

📡 No cameras connected. 
Start the Raspberry Pi camera service to begin.
```

### After Service Starts (5 seconds)

```
🎥 Raspberry Pi Cameras
[Refresh]

[aquaponics-pi-1 (1 images)]

[Black Box - Camera Preview]
Demo: aquaponics-pi-1
2024-01-15 10:30:45

Resolution: 640x480          | Type: JPEG
File Size: 45.2 KB           | Time: 10:30:45 AM

[📷 Fetch Latest] [⏸️ Auto-Refresh ON] [📜 History] [🗑️ Cleanup]

📊 Storage Stats
Total Images: 42    | Total Size: 1.8 MB    | Cameras: 1
```

### Auto-Refresh (Every 5 Seconds)
- Timestamp updates
- File size may change slightly
- Image count increases
- Storage stats update

---

## 🧪 Step 5: Test API Endpoints

**Terminal 4 (New):**

### Test 1: Get Camera List
```bash
curl http://localhost:5000/api/camera/list | jq
```

**Response:**
```json
{
  "cameras": [
    {
      "_id": "aquaponics-pi-1",
      "latest_image_id": "550e8400-e29b-41d4-a716-446655440000",
      "latest_timestamp": "2024-01-15T10:30:45.123Z",
      "resolution": "640x480",
      "total_images": 42,
      "total_size": 1890000
    }
  ],
  "total_cameras": 1
}
```

### Test 2: Get Latest Image
```bash
# Download and view
curl http://localhost:5000/api/camera/snapshot/aquaponics-pi-1 -o latest.jpg
file latest.jpg
```

**Output:**
```
latest.jpg: JPEG image data, 640 x 480, baseline, precision 8
```

### Test 3: Get Image as Base64
```bash
curl http://localhost:5000/api/camera/snapshot/aquaponics-pi-1/base64 | jq
```

**Response (truncated):**
```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "pi_name": "aquaponics-pi-1",
  "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "image_type": "jpeg",
  "resolution": "640x480",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "file_size": 45230
}
```

### Test 4: Get Storage Stats
```bash
curl http://localhost:5000/api/camera/stats | jq
```

**Response:**
```json
{
  "total_images": 42,
  "total_size_mb": "1.8",
  "by_camera": [
    {
      "_id": "aquaponics-pi-1",
      "count": 42,
      "total_size_bytes": 1890000,
      "total_size_mb": 1.8,
      "latest": "2024-01-15T10:30:45.123Z"
    }
  ]
}
```

### Test 5: Get Image History
```bash
curl "http://localhost:5000/api/camera/history/aquaponics-pi-1?limit=5" | jq
```

**Response:**
```json
{
  "pi_name": "aquaponics-pi-1",
  "total": 42,
  "images": [
    {
      "image_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "resolution": "640x480",
      "file_size": 45230,
      "is_recent": true
    },
    {
      "image_id": "550e8401-e29b-41d4-a716-446655440001",
      "timestamp": "2024-01-15T10:30:40.100Z",
      "resolution": "640x480",
      "file_size": 44890,
      "is_recent": false
    }
  ]
}
```

---

## 📊 Step 6: Monitor in Real-Time

**Watch Dashboard for 1 Minute:**

```
Time    | Images | Storage | Status
--------|--------|---------|--------
10:30   | 1      | 0.04 MB | Starting
10:31   | 12     | 0.54 MB | ✓ Running
10:32   | 24     | 1.08 MB | ✓ Running
10:33   | 36     | 1.62 MB | ✓ Running
10:34   | 48     | 2.16 MB | ✓ Running
```

**Expected Behavior:**
- 🟢 New image every ~5 seconds
- 🔄 Dashboard updates automatically
- 📈 Storage increases by ~45KB per image
- ✅ No errors in any terminal

---

## 🎬 Step 7: Create Timelapse Video

After collecting images, create a video:

### Script: Create MP4 Video

Create file `create_timelapse.sh`:

```bash
#!/bin/bash
# Create timelapse from camera images

PI_NAME="${1:-aquaponics-pi-1}"
OUTPUT="${2:-timelapse.mp4}"
FRAMERATE="${3:-2}"  # 2 FPS = 5x slower than real-time

echo "📥 Downloading images from database..."
cd /tmp
rm -rf aqua_images
mkdir aqua_images
cd aqua_images

# Get total image count
TOTAL=$(curl -s "http://localhost:5000/api/camera/history/$PI_NAME?limit=1" | \
  grep -o '"total":[0-9]*' | cut -d: -f2)

echo "📊 Found $TOTAL images"

# Download all images (100 at a time to avoid timeout)
for ((page=0; page<$TOTAL; page+=100)); do
  SKIP=$((TOTAL - page - 100))
  if [ $SKIP -lt 0 ]; then SKIP=0; fi
  
  echo "📥 Downloading batch $((page/100 + 1))..."
  
  curl -s "http://localhost:5000/api/camera/history/$PI_NAME?limit=100&skip=$SKIP" | \
    grep -o '"image_id":"[^"]*"' | cut -d'"' -f4 | while read ID; do
      curl -s "http://localhost:5000/api/camera/image/$ID" -o "img_$ID.jpg"
    done
done

echo "🎬 Creating video..."
ffmpeg -framerate $FRAMERATE \
  -pattern_type glob -i 'img_*.jpg' \
  -vf "scale=1920:-1:force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -crf 23 \
  -pix_fmt yuv420p \
  "../$OUTPUT"

echo "✅ Timelapse created: ../$OUTPUT"
cd ..
```

### Run:
```bash
chmod +x create_timelapse.sh
./create_timelapse.sh aquaponics-pi-1 timelapse.mp4 2
```

**Expected Output:**
```
📥 Downloading images from database...
📊 Found 240 images
📥 Downloading batch 1...
📥 Downloading batch 2...
📥 Downloading batch 3...
🎬 Creating video...
frame=  240 fps=0.0 q=-1Lbitrate=N/A
✅ Timelapse created: timelapse.mp4
```

**Result:** Video showing tank changes over time, compressed to 2 FPS (120 images = ~1 minute video)

---

## 🧹 Step 8: Cleanup Storage

After testing, clean up old images:

```bash
# Keep only 5 most recent images
curl -X DELETE "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=5"
```

**Response:**
```json
{
  "status": "success",
  "deleted_count": 237,
  "kept_count": 5,
  "message": "Kept 5 latest images"
}
```

---

## 📋 Complete Demo Timeline

| Time | Action | Terminal | Expected Output |
|------|--------|----------|-----------------|
| 0:00 | Start Backend | T1 | ✓ Server running, WebSocket ready |
| 0:30 | Start Frontend | T2 | ✓ React compiled, http://localhost:3000 |
| 1:00 | Start Camera | T3 | ⚠️ Demo mode, starting snapshots |
| 1:05 | Refresh Browser | Browser | 🎥 Camera Panel appears, 1 image |
| 1:10 | Check API | T4 | ✅ /camera/list returns camera info |
| 1:30 | View History | Browser | 📜 Click "History", see 6 images |
| 2:00 | Monitor Stats | Browser | 📊 Shows ~300KB storage used |
| 3:00 | Create Video | T4 | 🎬 timelapse.mp4 generated |
| 3:30 | Cleanup | T4 | 🗑️ Deleted old images, kept 5 |

---

## 🎯 Key Observations During Demo

### On Dashboard
✅ Camera Panel appears after ~5 seconds  
✅ Image updates every 5 seconds  
✅ Timestamp changes constantly  
✅ File size stays ~45KB (consistent)  
✅ Storage stats increase over time  
✅ Auto-refresh toggle works  
✅ History shows all captured images  

### On Backend
✅ POST requests logged every 5s  
✅ WebSocket broadcasts updates  
✅ No errors in console  
✅ Storage stats accessible via API  

### On Frontend
✅ Auto-refresh working (no manual refresh needed)  
✅ Responsive design works on mobile  
✅ History modal opens properly  
✅ Cleanup button functions  

---

## 🐛 Troubleshooting Demo

### Camera Panel Shows "No cameras connected"
```bash
# Check camera service is running
ps aux | grep camera_service.py

# Verify backend has routes
curl http://localhost:5000/api/camera/list

# Check JavaScript console (F12) for errors
```

### Images Not Updating
```bash
# Verify service is sending data
# Terminal 3 should show "✓ Snapshot sent" messages

# Check backend is receiving
curl http://localhost:5000/api/camera/stats

# Refresh browser
```

### Video Creation Fails
```bash
# Install ffmpeg if missing
sudo apt-get install ffmpeg

# Or use Docker
docker run -i -v /tmp:/tmp jrottenberg/ffmpeg ...
```

---

## 📈 Performance During Demo

**Resource Usage (Default Settings):**
- Python service: ~35MB RAM, 2-5% CPU
- Backend per request: ~1-2ms
- Frontend update: <100ms
- Network: ~50KB every 5 seconds

---

## 🎓 What This Demo Shows

✅ **End-to-End Data Flow**: Pi → Backend → Database → Frontend  
✅ **Real-Time Updates**: Auto-refresh without page reload  
✅ **API Functionality**: All endpoints working  
✅ **Storage Management**: Images properly stored and retrievable  
✅ **Video Generation**: Timelapse creation from captured images  
✅ **System Stability**: Runs continuously without crashes  

---

## 🚀 Next: Real Raspberry Pi

This demo uses **demo mode** (generates placeholder images).

To use with **real camera on Raspberry Pi**:

```bash
# 1. Install on actual Pi with camera module
ssh pi@<pi-ip>

# 2. Update .env
nano raspberry_pi_camera/.env
# Set BACKEND_URL to your server

# 3. Run service
python camera_service.py
# (Will auto-detect real camera)
```

Dashboard will show actual camera feed instead of demo images.

---

## 📚 Full Documentation

- [CAMERA_QUICK_START.md](./CAMERA_QUICK_START.md) - 5-minute setup
- [CAMERA_SETUP.md](./CAMERA_SETUP.md) - Complete reference
- [CAMERA_API_REFERENCE.md](./CAMERA_API_REFERENCE.md) - API testing
- [CAMERA_HARDWARE.md](./CAMERA_HARDWARE.md) - Hardware installation

Enjoy your camera demo! 🎬
