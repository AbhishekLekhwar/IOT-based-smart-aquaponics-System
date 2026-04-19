# 🎥 Camera API Testing & Examples

Quick reference for testing camera API endpoints with examples.

## 📡 Test Endpoints

All examples assume:
- Backend running: `http://localhost:5000`
- Camera name: `aquaponics-pi-1`

### Using cURL

#### 1. Get Camera List
```bash
curl http://localhost:5000/api/camera/list
```

**Response:**
```json
{
  "cameras": [
    {
      "_id": "aquaponics-pi-1",
      "latest_image_id": "550e8400-e29b-41d4-a716-446655440000",
      "latest_timestamp": "2024-01-15T10:30:45.000Z",
      "resolution": "640x480",
      "total_images": 42,
      "total_size": 1890234
    }
  ],
  "total_cameras": 1
}
```

#### 2. Get Latest Snapshot (Binary)
```bash
# Download as JPEG file
curl http://localhost:5000/api/camera/snapshot/aquaponics-pi-1 \
  -o latest.jpg

# Or view in browser
http://localhost:5000/api/camera/snapshot/aquaponics-pi-1
```

#### 3. Get Latest Snapshot (Base64)
```bash
curl http://localhost:5000/api/camera/snapshot/aquaponics-pi-1/base64
```

**Response:**
```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "pi_name": "aquaponics-pi-1",
  "image_data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "image_type": "jpeg",
  "resolution": "640x480",
  "timestamp": "2024-01-15T10:30:45.000Z",
  "file_size": 45230
}
```

#### 4. Get Image History
```bash
# Get 10 most recent images
curl "http://localhost:5000/api/camera/history/aquaponics-pi-1?limit=10"
```

**Response:**
```json
{
  "pi_name": "aquaponics-pi-1",
  "total": 42,
  "images": [
    {
      "image_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2024-01-15T10:30:45.000Z",
      "resolution": "640x480",
      "file_size": 45230,
      "is_recent": true
    }
  ]
}
```

#### 5. Get Storage Stats
```bash
curl http://localhost:5000/api/camera/stats
```

**Response:**
```json
{
  "total_images": 250,
  "total_size_mb": "125.3",
  "by_camera": [
    {
      "_id": "aquaponics-pi-1",
      "count": 250,
      "total_size_bytes": 131379200,
      "total_size_mb": 125.3,
      "latest": "2024-01-15T10:30:45.000Z"
    }
  ]
}
```

#### 6. Delete Old Images (Cleanup)
```bash
# Keep only 5 latest images, delete rest
curl -X DELETE "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=5"
```

**Response:**
```json
{
  "status": "success",
  "deleted_count": 245,
  "kept_count": 5,
  "message": "Kept 5 latest images"
}
```

#### 7. Delete Specific Image
```bash
curl -X DELETE "http://localhost:5000/api/camera/image/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "status": "success",
  "message": "Image deleted"
}
```

## 🧪 Testing with JavaScript

### Fetch All Cameras
```javascript
async function getCameras() {
  const response = await fetch('http://localhost:5000/api/camera/list');
  const data = await response.json();
  console.log('Cameras:', data.cameras);
}

getCameras();
```

### Display Latest Image
```javascript
async function displayLatestImage() {
  const response = await fetch(
    'http://localhost:5000/api/camera/snapshot/aquaponics-pi-1/base64'
  );
  const data = await response.json();
  
  const img = document.createElement('img');
  img.src = `data:image/${data.image_type};base64,${data.image_data}`;
  img.style.maxWidth = '100%';
  document.body.appendChild(img);
}

displayLatestImage();
```

### Auto-Refresh Every 5 Seconds
```javascript
async function autoRefreshImage() {
  const img = document.querySelector('img#camera');
  
  setInterval(async () => {
    const response = await fetch(
      'http://localhost:5000/api/camera/snapshot/aquaponics-pi-1/base64'
    );
    const data = await response.json();
    img.src = `data:image/${data.image_type};base64,${data.image_data}`;
  }, 5000);
}

autoRefreshImage();
```

### Monitor Storage Stats
```javascript
async function showStats() {
  const response = await fetch('http://localhost:5000/api/camera/stats');
  const data = await response.json();
  
  console.log(`Total Images: ${data.total_images}`);
  console.log(`Total Size: ${data.total_size_mb} MB`);
  
  data.by_camera.forEach(camera => {
    console.log(`${camera._id}: ${camera.count} images, ${camera.total_size_mb} MB`);
  });
}

showStats();
```

## 🧹 Maintenance Commands

### View All Images
```bash
# See all images for a camera (paginated)
curl "http://localhost:5000/api/camera/history/aquaponics-pi-1?limit=100&skip=0"
```

### Clean Storage Weekly
```bash
# Keep 200 most recent images
curl -X DELETE \
  "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=200"

# Or use cron job
# Add to crontab -e:
# 0 0 * * 0 curl -X DELETE "http://localhost:5000/api/camera/pi/aquaponics-pi-1/old?keep=200"
```

### Monitor Disk Usage
```bash
# Daily check
watch -n 86400 'curl http://localhost:5000/api/camera/stats'
```

## 📝 Example Workflows

### Workflow 1: Capture & Store
```bash
# Terminal 1: Start camera service
cd raspberry_pi_camera
python camera_service.py

# Terminal 2: Monitor system
while true; do
  clear
  curl http://localhost:5000/api/camera/stats
  sleep 5
done
```

### Workflow 2: Export Images
```bash
#!/bin/bash
# Export all images for a Pi to folder

PI_NAME="aquaponics-pi-1"
EXPORT_DIR="./exports/$PI_NAME"
mkdir -p "$EXPORT_DIR"

# Get image count
TOTAL=$(curl -s "http://localhost:5000/api/camera/history/$PI_NAME?limit=1" | \
  grep -o '"total":[0-9]*' | cut -d: -f2)

# Download all (100 at a time)
for ((i=0; i<TOTAL; i+=100)); do
  curl -s "http://localhost:5000/api/camera/history/$PI_NAME?limit=100&skip=$i" | \
    jq -r '.images[].image_id' | while read ID; do
      curl -s "http://localhost:5000/api/camera/image/$ID" -o "$EXPORT_DIR/$ID.jpg"
    done
done

echo "Exported $TOTAL images to $EXPORT_DIR"
```

### Workflow 3: Create Timelapse
```bash
#!/bin/bash
# Create timelapse from stored images

PI_NAME="aquaponics-pi-1"
OUTPUT="timelapse.mp4"

# Get all image IDs
curl -s "http://localhost:5000/api/camera/history/$PI_NAME?limit=1000" | \
  jq -r '.images[].image_id' | while read ID; do
    curl -s "http://localhost:5000/api/camera/image/$ID" -o "/tmp/$ID.jpg"
  done

# Create video (requires ffmpeg)
ffmpeg -framerate 2 -pattern_type glob -i '/tmp/*.jpg' \
  -vf "scale=1920:-1" -c:v libx264 -crf 23 "$OUTPUT"

echo "Timelapse created: $OUTPUT"
```

## 🔗 Integration Examples

### With Node.js Express
```javascript
const express = require('express');
const app = express();

app.get('/camera/view', async (req, res) => {
  const piName = req.query.pi || 'aquaponics-pi-1';
  
  const response = await fetch(
    `http://localhost:5000/api/camera/snapshot/${piName}/base64`
  );
  const data = await response.json();
  
  res.send(`
    <h1>Camera Feed: ${piName}</h1>
    <img src="data:image/${data.image_type};base64,${data.image_data}" style="max-width: 100%;">
  `);
});

app.listen(3001);
```

### With Python Requests
```python
import requests
import json
from datetime import datetime

def get_latest_image(pi_name='aquaponics-pi-1'):
    url = f'http://localhost:5000/api/camera/snapshot/{pi_name}/base64'
    response = requests.get(url)
    image_data = response.json()
    
    # Save to file
    with open(f'snapshot_{datetime.now().isoformat()}.jpg', 'wb') as f:
        import base64
        f.write(base64.b64decode(image_data['image_data']))

def get_storage_stats():
    url = 'http://localhost:5000/api/camera/stats'
    stats = requests.get(url).json()
    return stats

# Usage
get_latest_image()
stats = get_storage_stats()
print(f"Total storage: {stats['total_size_mb']} MB")
```

## 🚀 Performance Testing

### Test Image Upload Speed
```bash
# Generate test image
dd if=/dev/urandom of=test.jpg bs=50K count=1

# Measure upload time
time curl -X POST http://localhost:5000/api/camera/snapshot \
  -H "Content-Type: application/json" \
  -d @payload.json
```

### Stress Test (100 images/sec)
```bash
#!/bin/bash
# Generate test load

for i in {1..100}; do
  curl -X POST http://localhost:5000/api/camera/snapshot \
    -H "Content-Type: application/json" \
    -d '{"pi_name":"pi-1","image_data":"data","timestamp":"2024-01-15T10:30:45Z"}' &
done
wait

echo "100 requests completed"
```

## 📊 Database Queries

### View Stored Images (MongoDB)
```bash
# Connect to MongoDB
mongo

# Select database
use aquamonitor

# View camera images
db.camera_images.find().limit(10)

# Get size of collection
db.camera_images.stats().size

# Count images per Pi
db.camera_images.aggregate([
  { $group: { _id: '$pi_name', count: { $sum: 1 } } }
])
```

## ⚠️ API Limits

- **Max image size**: 50MB (per base64 payload)
- **Max request timeout**: 10 seconds
- **Cleanup keeps minimum**: 5 images
- **History limit**: 1000 images per request (paginate for more)
- **Rate limiting**: 500 requests/15min for /api endpoints

---

**Need more help?** See [CAMERA_SETUP.md](./CAMERA_SETUP.md) for full documentation.
