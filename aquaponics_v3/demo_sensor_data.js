#!/usr/bin/env node

/**
 * 🌱 Aquaponics Demo Data Generator
 * 
 * Generates realistic sensor data and posts it to the backend API
 * Usage: node demo_sensor_data.js
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000/api';

// Simulate realistic aquaponics sensor values
function generateSensorData(iteration = 0) {
  const baseTemp = 24 + Math.sin(iteration * 0.05) * 2; // Oscillates 22-26°C
  const basePH = 6.8 + Math.sin(iteration * 0.02) * 0.3; // Oscillates 6.5-7.1
  
  return {
    deviceId: 'demo-sensor-unit-01',
    waterTemperature: parseFloat((baseTemp + (Math.random() - 0.5)).toFixed(1)),
    roomTemperature: parseFloat((22 + Math.random() * 4).toFixed(1)),
    humidity: parseFloat((50 + Math.random() * 20).toFixed(1)),
    waterLevel: parseFloat((60 + Math.random() * 20).toFixed(1)),
    ph: parseFloat((basePH + (Math.random() - 0.5) * 0.2).toFixed(2)),
  };
}

// Send data to backend
function sendSensorData(data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/sensors/data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve({ success: true, status: res.statusCode });
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

// Main demo function
async function runDemo() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🌱 Aquaponics Demo Sensor Data Generator v1.0         ║
╚════════════════════════════════════════════════════════════╝

Generating 10 sensor readings...
Target: http://localhost:5000/api/sensors/data
  `);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < 10; i++) {
    try {
      const data = generateSensorData(i);
      await sendSensorData(data);
      
      console.log(`✓ Sent #${i + 1}:`);
      console.log(`  Water Temp: ${data.waterTemperature}°C`);
      console.log(`  Room Temp: ${data.roomTemperature}°C`);
      console.log(`  Humidity: ${data.humidity}%`);
      console.log(`  Water Level: ${data.waterLevel}%`);
      console.log(`  pH: ${data.ph}`);
      console.log();
      
      successCount++;
      
      // Wait 2 seconds between sends
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`✗ Error sending data #${i + 1}:`, error.message);
      failCount++;
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                      Results                              ║
╚════════════════════════════════════════════════════════════╝
✓ Success: ${successCount}
✗ Failed:  ${failCount}

📊 Check your dashboard at: http://localhost:3000/
   Sensor data should appear in real-time via WebSocket
  `);
}

// Run the demo
runDemo().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
