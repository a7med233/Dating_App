#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiFile = path.join(__dirname, 'services', 'api.js');

function switchToPhysicalDevice() {
  let content = fs.readFileSync(apiFile, 'utf8');
  
  // Replace Android emulator with physical device
  content = content.replace(
    /return 'http:\/\/10\.0\.2\.2:3000'; \/\/ Android emulator/,
    "// return 'http://10.0.2.2:3000'; // Android emulator"
  );
  content = content.replace(
    /\/\/ return 'http:\/\/192\.168\.0\.116:3000'; \/\/ Physical device/,
    "return 'http://192.168.0.116:3000'; // Physical device"
  );
  
  // Replace iOS simulator with physical device
  content = content.replace(
    /return 'http:\/\/localhost:3000'; \/\/ iOS simulator/,
    "// return 'http://localhost:3000'; // iOS simulator"
  );
  content = content.replace(
    /\/\/ return 'http:\/\/192\.168\.0\.116:3000'; \/\/ Physical device/,
    "return 'http://192.168.0.116:3000'; // Physical device"
  );
  
  fs.writeFileSync(apiFile, content);
  console.log('✅ Switched to Physical Device configuration');
  console.log('📱 API will now use: http://192.168.0.116:3000');
}

function switchToEmulator() {
  let content = fs.readFileSync(apiFile, 'utf8');
  
  // Replace Android physical device with emulator
  content = content.replace(
    /\/\/ return 'http:\/\/10\.0\.2\.2:3000'; \/\/ Android emulator/,
    "return 'http://10.0.2.2:3000'; // Android emulator"
  );
  content = content.replace(
    /return 'http:\/\/192\.168\.0\.116:3000'; \/\/ Physical device/,
    "// return 'http://192.168.0.116:3000'; // Physical device"
  );
  
  // Replace iOS physical device with simulator
  content = content.replace(
    /\/\/ return 'http:\/\/localhost:3000'; \/\/ iOS simulator/,
    "return 'http://localhost:3000'; // iOS simulator"
  );
  content = content.replace(
    /return 'http:\/\/192\.168\.0\.116:3000'; \/\/ Physical device/,
    "// return 'http://192.168.0.116:3000'; // Physical device"
  );
  
  fs.writeFileSync(apiFile, content);
  console.log('✅ Switched to Emulator configuration');
  console.log('🖥️  API will now use:');
  console.log('   Android: http://10.0.2.2:3000');
  console.log('   iOS: http://localhost:3000');
}

const command = process.argv[2];

if (command === 'physical') {
  switchToPhysicalDevice();
} else if (command === 'emulator') {
  switchToEmulator();
} else {
  console.log('Usage:');
  console.log('  node switch-api-config.js physical  - Switch to physical device config');
  console.log('  node switch-api-config.js emulator  - Switch to emulator config');
  console.log('');
  console.log('Current configuration:');
  console.log('  Your computer IP: 192.168.0.116');
  console.log('  Backend server: http://localhost:3000');
} 