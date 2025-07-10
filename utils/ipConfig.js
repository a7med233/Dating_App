import AsyncStorage from '@react-native-async-storage/async-storage';

// IP Configuration Utility
export const IP_CONFIG_KEY = 'API_IP_ADDRESS';

// Get the current IP address from storage or return default
export const getStoredIPAddress = async () => {
  try {
    const storedIP = await AsyncStorage.getItem(IP_CONFIG_KEY);
    return storedIP || '192.168.0.116'; // Updated default fallback
  } catch (error) {
    console.error('Error getting stored IP:', error);
    return '192.168.0.116'; // Updated default fallback
  }
};

// Set the current IP address
export const setStoredIPAddress = async (ipAddress) => {
  try {
    await AsyncStorage.setItem(IP_CONFIG_KEY, ipAddress);
    console.log('IP address saved:', ipAddress);
    return true;
  } catch (error) {
    console.error('Error saving IP address:', error);
    return false;
  }
};

// Clear the stored IP address
export const clearStoredIPAddress = async () => {
  try {
    await AsyncStorage.removeItem(IP_CONFIG_KEY);
    console.log('IP address cleared');
    return true;
  } catch (error) {
    console.error('Error clearing IP address:', error);
    return false;
  }
};

// Helper function to get your computer's IP address
// You can run this in your terminal to find your IP:
// Windows: ipconfig
// Mac/Linux: ifconfig or ip addr
export const getComputerIPInstructions = () => {
  const instructions = {
    windows: [
      '1. Open Command Prompt (cmd)',
      '2. Type: ipconfig',
      '3. Look for "IPv4 Address" under your WiFi adapter',
      '4. It will look like: 192.168.x.x or 10.0.x.x'
    ],
    mac: [
      '1. Open Terminal',
      '2. Type: ifconfig | grep "inet " | grep -v 127.0.0.1',
      '3. Look for your local IP address (usually starts with 192.168 or 10.0)'
    ],
    linux: [
      '1. Open Terminal',
      '2. Type: ip addr show | grep "inet " | grep -v 127.0.0.1',
      '3. Look for your local IP address'
    ]
  };
  
  return instructions;
};

// Common IP address patterns for different networks
export const COMMON_IP_PATTERNS = {
  homeWifi: ['192.168.1.', '192.168.0.', '10.0.0.'],
  mobileHotspot: ['172.20.10.', '192.168.43.'],
  officeNetwork: ['10.0.', '172.16.', '192.168.'],
}; 