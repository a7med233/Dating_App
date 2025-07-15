// Environment Configuration for Admin Panel
// This ensures environment variables are properly loaded

const getEnvironmentVariable = (key, defaultValue = '') => {
  // Try to get from import.meta.env first (Vite)
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // Fallback to process.env (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return defaultValue;
};

// Production API URLs
const PRODUCTION_API_URL = 'https://lashwa.com/api';
const PRODUCTION_SOCKET_URL = 'https://lashwa.com/api';

// Development API URLs
const DEVELOPMENT_API_URL = 'http://localhost:3000/api';
const DEVELOPMENT_SOCKET_URL = 'http://localhost:3000/api';

// Determine if we're in production
const isProduction = getEnvironmentVariable('VITE_NODE_ENV') === 'production' || 
                    window.location.hostname !== 'localhost';

// Export environment configuration
export const environment = {
  // API Configuration
  API_BASE_URL: getEnvironmentVariable('VITE_API_BASE_URL') || 
                (isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL),
  
  SOCKET_URL: getEnvironmentVariable('VITE_SOCKET_URL') || 
              (isProduction ? PRODUCTION_SOCKET_URL : DEVELOPMENT_SOCKET_URL),
  
  API_TIMEOUT: parseInt(getEnvironmentVariable('VITE_API_TIMEOUT')) || 30000,
  
  // App Configuration
  APP_NAME: getEnvironmentVariable('VITE_APP_NAME') || 'Lashwa Admin Panel',
  APP_VERSION: getEnvironmentVariable('VITE_APP_VERSION') || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: getEnvironmentVariable('VITE_ENABLE_ANALYTICS') !== 'false',
  ENABLE_NOTIFICATIONS: getEnvironmentVariable('VITE_ENABLE_NOTIFICATIONS') !== 'false',
  ENABLE_REPORTS: getEnvironmentVariable('VITE_ENABLE_REPORTS') !== 'false',
  
  // Environment
  NODE_ENV: getEnvironmentVariable('VITE_NODE_ENV') || 'development',
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
};

// Debug logging (only in development)
if (!isProduction) {
  console.log('Environment Configuration:', environment);
}

export default environment; 