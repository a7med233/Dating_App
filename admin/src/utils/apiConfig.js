import { environment } from '../config/environment.js';

// Centralized API configuration
export const API_BASE_URL = environment.API_BASE_URL;
export const SOCKET_URL = environment.SOCKET_URL;

// Debug logging
console.log('Admin Panel Environment Variables:');
console.log('Environment:', environment);
console.log('API_BASE_URL (resolved):', API_BASE_URL);
console.log('SOCKET_URL (resolved):', SOCKET_URL);

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}; 