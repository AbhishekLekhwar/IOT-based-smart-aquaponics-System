#!/usr/bin/env node

/**
 * 🎥 Demo Camera Photo Rotator
 * 
 * Cycles through demo photos every 2 seconds
 * Sends them to the backend camera API endpoint
 * Simulates real camera snapshots from a Raspberry Pi
 * 
 * Usage: node camera-demo.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BACKEND_URL = 'http://localhost:5000/api';
const DEMO_PHOTOS_DIR = path.join(__dirname, 'demophotos');
const INTERVAL = 2000; // Update every 2 seconds
const PI_NAME = 'aquaponics-camera-01';

let photoIndex = 0;
let photoCount = 0;
let sendCount = 0;
let errorCount = 0;

// Get all photos from demophotos directory
function getPhotos() {
  try {
    const files = fs.readdirSync(DEMO_PHOTOS_DIR);
    const photos = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
    return photos.sort();
  } catch (error) {
    console.error('❌ Error reading demo photos:', error.message);
    return [];
  }
}

// Helper to send HTTP requests
function sendRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode, data: responseData });
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Print fancy header
function printHeader() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  🎥 Camera Demo Photo Rotator v1.0                              ║
║  Cycling through demo photos every 2 seconds...                  ║
╚══════════════════════════════════════════════════════════════════╝

📸 Demo Photos Directory: ${DEMO_PHOTOS_DIR}
🔄 Interval: 2 seconds
📡 Target: ${BACKEND_URL}/camera/snapshot
🎬 Camera Name: ${PI_NAME}
🔗 View at: http://localhost:3000/camera

Press Ctrl+C to stop
  `);
}

// Print current status
function printStatus(photoName, count, errors) {
  const status = errors === 0 ? '✅' : '⚠️';
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`
${status} Photo #${count} [${timestamp}]
┌─ Current Photo ─────────────────────────────────────────────────┐
│  File Name:        ${photoName}
│  Index:            ${photoIndex}/${photoCount}
│  Total Sent:       ${count}
│  Errors:           ${errors}
└─────────────────────────────────────────────────────────────────┘
  `);
}

// Main demo generator
async function startCameraDemo() {
  const photos = getPhotos();
  
  if (photos.length === 0) {
    console.error('❌ No demo photos found in', DEMO_PHOTOS_DIR);
    process.exit(1);
  }

  photoCount = photos.length;
  printHeader();
  console.log(`\n📷 Found ${photos.length} photos: ${photos.join(', ')}\n`);

  // Send first photo immediately
  try {
    const photoPath = path.join(DEMO_PHOTOS_DIR, photos[0]);
    const imageBuffer = fs.readFileSync(photoPath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(photos[0]).toLowerCase().substring(1);

    await sendRequest('/api/camera/snapshot', 'POST', {
      pi_name: PI_NAME,
      image_data: base64,
      image_type: ext === 'webp' ? 'webp' : ext === 'jpg' ? 'jpeg' : ext,
      resolution: '1920x1080',
      timestamp: new Date().toISOString()
    });

    sendCount++;
    printStatus(photos[0], sendCount, errorCount);
  } catch (error) {
    errorCount++;
    console.error(`\n❌ Error sending first photo: ${error.message}`);
  }

  // Set interval to rotate photos every 2 seconds
  const interval = setInterval(async () => {
    try {
      photoIndex = (photoIndex + 1) % photoCount;
      const photoName = photos[photoIndex];
      const photoPath = path.join(DEMO_PHOTOS_DIR, photoName);
      
      // Read image file
      const imageBuffer = fs.readFileSync(photoPath);
      const base64 = imageBuffer.toString('base64');
      const ext = path.extname(photoName).toLowerCase().substring(1);

      // Send to camera API
      await sendRequest('/api/camera/snapshot', 'POST', {
        pi_name: PI_NAME,
        image_data: base64,
        image_type: ext === 'webp' ? 'webp' : ext === 'jpg' ? 'jpeg' : ext,
        resolution: '1920x1080',
        timestamp: new Date().toISOString()
      });

      sendCount++;
      printStatus(photoName, sendCount, errorCount);

    } catch (error) {
      errorCount++;
      console.error(`\n❌ Error sending photo: ${error.message}`);
    }
  }, INTERVAL);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n
╔══════════════════════════════════════════════════════════════════╗
║                    🛑 Camera Demo Stopped                        ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Photos Sent:  ${sendCount}
║  Errors:             ${errorCount}
║  Success Rate:       ${sendCount > 0 ? ((sendCount - errorCount) / sendCount * 100).toFixed(1) : 0}%
╚══════════════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  });
}

// Start the demo
startCameraDemo().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
