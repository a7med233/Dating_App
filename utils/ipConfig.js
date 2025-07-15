import AsyncStorage from '@react-native-async-storage/async-storage';

// IP Configuration Utility
export const IP_CONFIG_KEY = 'API_IP_ADDRESS';

// Get the current IP address from storage or return default
export const getStoredIPAddress = async () => {
  try {
    const storedIP = await AsyncStorage.getItem(IP_CONFIG_KEY);
    if (storedIP) {
      console.log('Found stored IP address:', storedIP);
      return storedIP;
    }
    
    // Check for environment variable from EAS build
    if (process.env.API_BASE_URL) {
      console.log('Using environment API URL:', process.env.API_BASE_URL);
      return process.env.API_BASE_URL;
    }
    
    // For development, use the computer's IP address
    if (__DEV__) {
      console.log('Development mode detected, using local IP');
      return 'http://192.168.0.116:3000/api';
    }
    
    // For production, use the production URL
    console.log('Production mode detected, using production API');
    return 'https://lashwa.com/api';
  } catch (error) {
    console.error('Error getting stored IP:', error);
    
    // Check for environment variable from EAS build
    if (process.env.API_BASE_URL) {
      console.log('Using environment API URL (fallback):', process.env.API_BASE_URL);
      return process.env.API_BASE_URL;
    }
    
    // For development, use the computer's IP address
    if (__DEV__) {
      console.log('Development mode detected (fallback), using local IP');
      return 'http://192.168.0.116:3000/api';
    }
    
    // For production, use the production URL
    console.log('Production mode detected (fallback), using production API');
    return 'https://lashwa.com/api';
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

// Force production API URL (for testing)
export const forceProductionAPI = async () => {
  try {
    await AsyncStorage.setItem(IP_CONFIG_KEY, 'https://lashwa.com/api');
    console.log('Forced production API URL');
    return true;
  } catch (error) {
    console.error('Error forcing production API:', error);
    return false;
  }
};

// Force development API URL (for testing)
export const forceDevelopmentAPI = async () => {
  try {
    await AsyncStorage.setItem(IP_CONFIG_KEY, 'http://192.168.0.116:3000/api');
    console.log('Forced development API URL');
    return true;
  } catch (error) {
    console.error('Error forcing development API:', error);
    return false;
  }
};

// Get current environment info
export const getEnvironmentInfo = () => {
  return {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,
    environment: __DEV__ ? 'Development' : 'Production',
    nodeEnv: process.env.NODE_ENV || 'not set',
    apiBaseUrl: process.env.API_BASE_URL || 'not set',
    defaultAPI: __DEV__ ? 'http://192.168.0.116:3000/api' : 'https://lashwa.com/api'
  };
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