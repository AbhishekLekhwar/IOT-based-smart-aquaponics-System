#!/usr/bin/env node

/**
 * 🌱 Comprehensive Aquaponics Data Simulator
 * 
 * Generates realistic historical sensor data with:
 * - Multiple time-series data points
 * - Various alert scenarios
 * - Historical logs and trends
 * - Edge cases and anomalies
 * 
 * Usage: node simulator.js
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000/api';
const READINGS_PER_SCENARIO = 20; // Generate 20 readings per scenario
const DELAY_BETWEEN_REQUESTS = 100; // milliseconds

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
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate sensor data for different scenarios
class DataGenerator {
  constructor() {
    this.startTime = Date.now() - (24 * 60 * 60 * 1000); // Start 24 hours ago
  }

  // Scenario 1: Normal stable operation
  generateNormalOperation(index) {
    const baseTemp = 24 + Math.sin(index * 0.05) * 0.5;
    const baseGas = 400 + Math.sin(index * 0.02) * 100;
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((baseTemp + (Math.random() - 0.5) * 0.3).toFixed(1)),
      roomTemperature: parseFloat((22 + Math.random() * 2).toFixed(1)),
      humidity: parseFloat((55 + Math.random() * 10).toFixed(1)),
      waterLevel: parseFloat((70 + Math.random() * 5).toFixed(1)),
      gasSensor: parseFloat((baseGas + (Math.random() - 0.5) * 50).toFixed(1)),
    };
  }

  // Scenario 2: Temperature rising (warning)
  generateHighTemperature(index) {
    const temp = 26 + Math.random() * 3; // 26–29°C (warning zone)
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat(temp.toFixed(1)),
      roomTemperature: parseFloat((25 + Math.random() * 3).toFixed(1)),
      humidity: parseFloat((60 + Math.random() * 15).toFixed(1)),
      waterLevel: parseFloat((65 + Math.random() * 8).toFixed(1)),
      gasSensor: parseFloat((450 + Math.random() * 100).toFixed(1)),
    };
  }

  // Scenario 3: pH dropping (critical)
  generateLowPH(index) {
    const gas = 1200 + Math.random() * 600; // 1200-1800 ppm (warning zone)
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((23 + Math.random() * 2).toFixed(1)),
      roomTemperature: parseFloat((21 + Math.random() * 2).toFixed(1)),
      humidity: parseFloat((50 + Math.random() * 8).toFixed(1)),
      waterLevel: parseFloat((68 + Math.random() * 6).toFixed(1)),
      gasSensor: parseFloat(gas.toFixed(1)),
    };
  }

  // Scenario 4: Water level low
  generateLowWaterLevel(index) {
    const level = 30 + Math.random() * 15; // 30-45% (critical zone)
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((24 + Math.random() * 1.5).toFixed(1)),
      roomTemperature: parseFloat((22 + Math.random() * 2).toFixed(1)),
      humidity: parseFloat((70 + Math.random() * 10).toFixed(1)),
      waterLevel: parseFloat(level.toFixed(1)),
      gasSensor: parseFloat((400 + Math.random() * 100).toFixed(1)),
    };
  }

  // Scenario 5: High humidity warning
  generateHighHumidity(index) {
    const humidity = 75 + Math.random() * 20; // 75-95% (high zone)
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((24 + Math.random() * 1).toFixed(1)),
      roomTemperature: parseFloat((23 + Math.random() * 2).toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      waterLevel: parseFloat((72 + Math.random() * 4).toFixed(1)),
      gasSensor: parseFloat((500 + Math.random() * 200).toFixed(1)),
    };
  }

  // Scenario 6: Recovery - returning to normal
  generateRecovery(index) {
    const progress = index / READINGS_PER_SCENARIO;
    const baseTemp = 26 + (1 - progress) * 3; // Cooling down from 29°C to 26°C
    const baseGas = 1500 + (1 - progress) * 800; // Gas decreasing
    
    return {
      deviceId: 'aquaponics-unit-01',
      waterTemperature: parseFloat((baseTemp + (Math.random() - 0.5) * 0.5).toFixed(1)),
      roomTemperature: parseFloat((22 + Math.random() * 2).toFixed(1)),
      humidity: parseFloat((55 + Math.random() * 10).toFixed(1)),
      waterLevel: parseFloat((70 + Math.random() * 5).toFixed(1)),
      gasSensor: parseFloat((baseGas + (Math.random() - 0.5) * 50).toFixed(1)),
    };
  }
}

// Main simulator
async function runSimulator() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  🌱 Comprehensive Aquaponics Data Simulator v2.0                 ║
║  Generating 120 readings across 6 scenarios...                   ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  const generator = new DataGenerator();
  let totalSent = 0;
  let failCount = 0;

  const scenarios = [
    { name: '📊 Normal Operation (20 readings)', generator: () => generator.generateNormalOperation },
    { name: '🔴 High Temperature Warning (20 readings)', generator: () => generator.generateHighTemperature },
    { name: '🟠 High Gas Level Warning (20 readings)', generator: () => generator.generateLowPH },
    { name: '🟡 Low Water Level Warning (20 readings)', generator: () => generator.generateLowWaterLevel },
    { name: '🟠 High Humidity Alert (20 readings)', generator: () => generator.generateHighHumidity },
    { name: '🟢 System Recovery (20 readings)', generator: () => generator.generateRecovery },
  ];

  const generatorFunctions = [
    generator.generateNormalOperation.bind(generator),
    generator.generateHighTemperature.bind(generator),
    generator.generateLowPH.bind(generator),
    generator.generateLowWaterLevel.bind(generator),
    generator.generateHighHumidity.bind(generator),
    generator.generateRecovery.bind(generator),
  ];

  // Execute each scenario
  for (let scenarioIndex = 0; scenarioIndex < scenarios.length; scenarioIndex++) {
    const scenario = scenarios[scenarioIndex];
    const generatorFunc = generatorFunctions[scenarioIndex];
    
    console.log(`\n${scenario.name}`);
    
    for (let i = 0; i < READINGS_PER_SCENARIO; i++) {
      try {
        const data = generatorFunc(i);
        await sendRequest('/api/sensors/data', 'POST', data);
        
        totalSent++;
        const progress = ((i + 1) / READINGS_PER_SCENARIO * 100).toFixed(0);
        process.stdout.write(`  ✓ Reading ${i + 1}/${READINGS_PER_SCENARIO} (${progress}%)\r`);
        
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error) {
        failCount++;
        console.log(`\n  ✗ Failed to send reading ${i + 1}: ${error.message}`);
      }
    }
    console.log(`  ✓ Scenario complete!\n`);
  }

  // Summary
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                     ✨ SIMULATION COMPLETE ✨                   ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Readings Sent:  ${totalSent}
║  Failed Requests:      ${failCount}
║  Success Rate:         ${((totalSent / (totalSent + failCount)) * 100).toFixed(1)}%
╠══════════════════════════════════════════════════════════════════╣
║  📊 Dashboard Updated:                                           ║
║     ✓ Real-time sensor cards                                     ║
║     ✓ Historical charts (temperature, pH, humidity, etc.)        ║
║     ✓ Alert logs with various severity levels                    ║
║     ✓ System health metrics                                      ║
║     ✓ Data export history                                        ║
║                                                                   ║
║  🔗 Visit: http://localhost:3000                                 ║
║     • Dashboard page for live graphs                             ║
║     • History page for detailed trends                           ║
║     • Alerts page for all logged alerts                          ║
║     • System Health for statistics                               ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}

// Run the simulator
runSimulator().catch(error => {
  console.error('\n❌ Simulator Error:', error.message);
  process.exit(1);
});
