import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Function to get the correct API base URL
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android - try emulator first, then physical device
    // If testing on physical device, uncomment the line below and comment out the emulator line
    // return 'http://10.0.2.2:3000'; // Android emulator
    return 'http://192.168.0.116:3000'; // Physical device - replace with your computer's IP
  } else if (Platform.OS === 'ios') {
    // For iOS - try simulator first, then physical device
    // If testing on physical device, uncomment the line below and comment out the simulator line
    // return 'http://localhost:3000'; // iOS simulator
    return 'http://192.168.0.116:3000'; // Physical device - replace with your computer's IP
  } else {
    // For web or other platforms
    return 'http://localhost:3000';
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log('Platform:', Platform.OS);
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for slower database queries
});

// Attach token if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Error config:', error.config);
    console.error('Error response:', error.response);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    if (error.code === 'ERR_BAD_REQUEST') {
      throw new Error('Invalid request. Please check your input and try again.');
    }
    throw error;
  }
);

// Helper functions
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (userData) => api.post('/login', userData);
export const fetchMessages = (params) => api.get('/messages', { params });
export const likeProfile = (data) => api.post('/like-profile', data);
export const createMatch = (data) => api.post('/create-match', data);
export const getUserDetails = (userId) => api.get(`/users/${userId}`);
export const updateProfileVisibility = (userId, visibilitySettings) => api.put(`/users/${userId}/visibility`, visibilitySettings);
export const fetchMatches = (userId) => api.get(`/matches?userId=${userId}`);
export const fetchReceivedLikes = (userId) => api.get(`/received-likes/${userId}`);
export const getUserMatches = (userId) => api.get(`/get-matches/${userId}`);

// Photo upload functions
export const uploadPhoto = (imageBase64, userId) => api.post('/upload-photo', { imageBase64, userId });
export const uploadPhotos = (images, userId) => api.post('/upload-photos', { images, userId });

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    console.log('Checking email:', email, 'at URL:', API_BASE_URL);
    const response = await api.post('/check-email', { email });
    console.log('Email check response:', response.data);
    return false; // Email is available
  } catch (err) {
    console.error('Email check error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      response: err.response?.data,
      status: err.response?.status
    });
    
    if (err.response && err.response.status === 409) {
      return true; // Email exists
    }
    
    // Re-throw the error with a more user-friendly message
    if (err.message.includes('Network error') || err.message.includes('timeout')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    if (err.message.includes('Invalid request')) {
      throw new Error('Invalid email format. Please check your input and try again.');
    }
    throw new Error('Error checking email. Please try again.');
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await api.post('/check-email', { email: 'test@example.com' });
    console.log('API test successful:', response.data);
    return true;
  } catch (err) {
    console.error('API test failed:', err);
    return false;
  }
};

// Notification API endpoints
export const getNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/read/${notificationId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/read-all`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (userId, notificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}/${notificationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export default api; 