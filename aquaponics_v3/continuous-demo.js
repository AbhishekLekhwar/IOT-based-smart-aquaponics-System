#!/usr/bin/env node

/**
 * 🌱 Continuous Aquaponics Data Generator
 * 
 * Generates and sends sensor data every 2 seconds continuously
 * Simulates real-time sensor readings with realistic fluctuations
 * 
 * Usage: node continuous-demo.js
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000/api';
const INTERVAL = 2000; // Update every 2 seconds

let dataCount = 0;
let errorCount = 0;

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
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Realistic sensor data generator with variations
class RealTimeDataGenerator {
  constructor() {
    this.time = 0;
    this.tempOffset = Math.random() * 2 - 1;
    this.gasOffset = Math.random() * 200 - 100;
    this.humidityOffset = Math.random() * 10 - 5;
  }

  generate() {
    this.time++;
    
    // Simulate realistic fluctuations with periodic patterns
    const tempCycle = Math.sin(this.time * 0.02) * 1.5; // Slow temperature variations
    const gasCycle = Math.sin(this.time * 0.01) * 100; // Slow gas variations
    const humidCycle = Math.cos(this.time * 0.03) * 5; // Humidity waves
    const levelDrift = Math.sin(this.time * 0.005) * 3; // Water level slow drift
    
    // Add random jitter for realistic noise
    const tempJitter = (Math.random() - 0.5) * 0.5;
    const gasJitter = (Math.random() - 0.5) * 50;
    const humidJitter = (Math.random() - 0.5) * 3;
    const levelJitter = (Math.random() - 0.5) * 2;
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((24 + this.tempOffset + tempCycle + tempJitter).toFixed(1)),
      roomTemperature: parseFloat((22 + Math.sin(this.time * 0.015) * 2 + (Math.random() - 0.5) * 1).toFixed(1)),
      humidity: parseFloat((60 + this.humidityOffset + humidCycle + humidJitter).toFixed(1)),
      waterLevel: parseFloat((70 + levelDrift + levelJitter).toFixed(1)),
      gasSensor: parseFloat((400 + this.gasOffset + gasCycle + gasJitter).toFixed(1)),
    };
  }
}

// Print fancy header
function printHeader() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  🌱 Continuous Aquaponics Real-Time Data Generator v1.0          ║
║  Sending sensor readings every 2 seconds...                      ║
╚══════════════════════════════════════════════════════════════════╝

⏱️  Interval: 2 seconds
📡 Target: http://localhost:5000/api/sensors/data
🔗 View at: http://localhost:3000

Press Ctrl+C to stop
  `);
}

// Print current reading
function printReading(data, count, errors) {
  const status = errors === 0 ? '✅' : '⚠️';
  
  console.log(`
${status} Reading #${count} (Errors: ${errors})
┌─ Sensor Values ────────────────────────────────────────────────┐
│  Water Temperature:  ${data.waterTemperature}°C
│  Room Temperature:   ${data.roomTemperature}°C
│  Humidity:           ${data.humidity}%
│  Water Level:        ${data.waterLevel}%
│  Gas Level:          ${data.gasSensor} ppm
└────────────────────────────────────────────────────────────────┘
  `);
}

// Main continuous generator
async function startContinuousDemo() {
  printHeader();
  
  const generator = new RealTimeDataGenerator();
  
  const interval = setInterval(async () => {
    try {
      const data = generator.generate();
      await sendRequest('/api/sensors/data', 'POST', data);
      
      dataCount++;
      printReading(data, dataCount, errorCount);
      
    } catch (error) {
      errorCount++;
      console.error(`\n❌ Error sending data: ${error.message}`);
      console.log(`   Retrying in 2 seconds...\n`);
    }
  }, INTERVAL);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n
╔══════════════════════════════════════════════════════════════════╗
║                    🛑 Generator Stopped                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Readings Sent:  ${dataCount}
║  Failed Requests:      ${errorCount}
║  Success Rate:         ${((dataCount / (dataCount + errorCount)) * 100).toFixed(1)}%
╚══════════════════════════════════════════════════════════════════╝
    `);
    process.exit(0);
  });
}

// Start the demo
startContinuousDemo().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
