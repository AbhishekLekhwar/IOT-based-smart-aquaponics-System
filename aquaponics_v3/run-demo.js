#!/usr/bin/env node

/**
 * 🌱 Aquaponics Demo Runner - Complete System Tester
 * 
 * This script runs both sensor and camera demos with proper sequencing
 * and visual feedback for the complete system test.
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log(`║  ${title.padEnd(58)}  ║`, 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');
}

async function checkBackend() {
  return new Promise((resolve) => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function runDemo(scriptPath, name) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = scriptPath.endsWith('.py') 
      ? (isWindows ? 'python' : 'python3')
      : 'node';
    
    const child = spawn(command, [scriptPath], {
      cwd: path.dirname(scriptPath),
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✓ ${name} completed successfully`, 'green');
        resolve();
      } else {
        log(`✗ ${name} exited with code ${code}`, 'red');
        reject(new Error(`${name} failed`));
      }
    });

    child.on('error', (err) => {
      log(`✗ ${name} error: ${err.message}`, 'red');
      reject(err);
    });
  });
}

async function main() {
  header('🌱 Aquaponics Complete Demo Runner');

  log('Starting system check...', 'yellow');

  // Check backend
  log('\n📋 Checking backend connectivity...', 'yellow');
  const backendUp = await checkBackend();
  
  if (!backendUp) {
    log('\n✗ Backend not accessible at http://localhost:5000', 'red');
    log('  Please ensure:', 'yellow');
    log('    1. Backend is running: cd backend && npm start', 'dim');
    log('    2. Port 5000 is not blocked', 'dim');
    log('    3. MongoDB is running', 'dim');
    process.exit(1);
  }

  log('✓ Backend is running', 'green');

  // Show configuration
  log('\n⚙️  Demo Configuration:', 'cyan');
  log('  Backend URL: http://localhost:5000', 'dim');
  log('  Frontend URL: http://localhost:3000', 'dim');
  log('  Sensor Demo: 10 readings @ 2-second intervals', 'dim');
  log('  Camera Demo: 5 images @ 3-second intervals', 'dim');

  // Ask user confirmation
  log('\n📺 View Options:', 'cyan');
  log('  1. Open http://localhost:3000 in your browser', 'blue');
  log('  2. Watch sensor cards update in real-time', 'blue');
  log('  3. Check camera page for generated images', 'blue');

  log('\n🚀 Starting demos...', 'yellow');

  try {
    // Run sensor demo
    log('\n📊 Running Sensor Demo', 'magenta');
    log('═'.repeat(60), 'magenta');
    
    const sensorScript = path.join(__dirname, 'demo_sensor_data.js');
    await runDemo(sensorScript, 'Sensor Demo');

    // Brief pause
    log('\n⏱️  Waiting 2 seconds before camera demo...', 'yellow');
    await new Promise(r => setTimeout(r, 2000));

    // Run camera demo
    log('\n📷 Running Camera Demo', 'magenta');
    log('═'.repeat(60), 'magenta');
    
    const cameraScript = path.join(__dirname, 'demo_camera_data.py');
    await runDemo(cameraScript, 'Camera Demo');

    // Success summary
    header('✅ Demo Run Complete!');

    log('📊 Sensor Demo Results:', 'green');
    log('  • 10 readings sent successfully', 'dim');
    log('  • Check dashboard for real-time updates', 'dim');

    log('\n📷 Camera Demo Results:', 'green');
    log('  • 5 images generated and uploaded', 'dim');
    log('  • Check Camera page to preview', 'dim');

    log('\n🎯 Next Steps:', 'cyan');
    log('  1. Verify sensor values on dashboard', 'dim');
    log('  2. Verify camera images on Camera page', 'dim');
    log('  3. Check alerts page for any triggered alerts', 'dim');
    log('  4. Review system health status', 'dim');

    log('\n📚 For more information:', 'blue');
    log('  • See DEMO_GUIDE.md for detailed instructions', 'dim');
    log('  • See ESP32_QUICK_START.md for hardware setup', 'dim');
    log('  • See ARCHITECTURE.md for system overview', 'dim');

  } catch (error) {
    log('\n✗ Demo run failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    log('\n💡 Troubleshooting:', 'yellow');
    log('  • Check backend logs for errors', 'dim');
    log('  • Verify MongoDB is running', 'dim');
    log('  • Check network connectivity', 'dim');
    process.exit(1);
  }
}

main().catch(err => {
  log(`\n✗ Unexpected error: ${err.message}`, 'red');
  process.exit(1);
});
