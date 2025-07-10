const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const address of networkInterface) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push({
          interface: interfaceName,
          address: address.address,
          netmask: address.netmask,
          cidr: address.cidr
        });
      }
    }
  }

  return addresses;
}

function displayIPAddresses() {
  console.log('🔍 Finding your local IP addresses...\n');
  
  const addresses = getLocalIPAddress();
  
  if (addresses.length === 0) {
    console.log('❌ No local IP addresses found');
    return;
  }

  console.log('📱 Available IP addresses for your API:');
  console.log('=====================================\n');

  addresses.forEach((addr, index) => {
    console.log(`${index + 1}. Interface: ${addr.interface}`);
    console.log(`   IP Address: ${addr.address}`);
    console.log(`   Network: ${addr.cidr}`);
    console.log('');
  });

  console.log('💡 Instructions:');
  console.log('1. Choose the IP address that matches your WiFi network');
  console.log('2. Update your app configuration with this IP');
  console.log('3. Make sure your phone and computer are on the same network');
  console.log('4. Test the connection in your app\n');

  // Suggest the most likely IP
  const wifiAddress = addresses.find(addr => 
    addr.interface.toLowerCase().includes('wi-fi') || 
    addr.interface.toLowerCase().includes('wlan') ||
    addr.interface.toLowerCase().includes('wireless')
  );

  if (wifiAddress) {
    console.log('🎯 Recommended IP (WiFi):', wifiAddress.address);
  } else if (addresses.length > 0) {
    console.log('🎯 Recommended IP:', addresses[0].address);
  }
}

// Run the script
if (require.main === module) {
  displayIPAddresses();
}

module.exports = { getLocalIPAddress, displayIPAddresses }; 