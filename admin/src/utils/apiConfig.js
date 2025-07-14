// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

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