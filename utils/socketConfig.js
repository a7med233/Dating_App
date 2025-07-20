// Centralized Socket.IO configuration
// Always use the online server for better compatibility with Expo Go

export const getSocketUrl = () => {
  // Always use the online server for Socket.IO
  // This ensures compatibility with Expo Go and avoids local network issues
  return 'https://lashwa.com';
};

export const getSocketConfig = () => {
  return {
    transports: ['polling', 'websocket'], // Use polling first, more reliable for mobile
    timeout: 30000, // 30 second timeout
    forceNew: true, // Force new connection
    reconnection: true, // Enable reconnection
    reconnectionAttempts: 5, // Try to reconnect 5 times
    reconnectionDelay: 1000, // Wait 1 second between attempts
    reconnectionDelayMax: 5000, // Max 5 seconds between attempts
    upgrade: false, // Disable automatic upgrade to websocket
  };
};

// For API calls that need the base URL
export const getApiBaseUrl = () => {
  return 'https://lashwa.com/api';
}; 