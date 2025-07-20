import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStoredIPAddress } from '../utils/ipConfig';

// Function to get the current IP address dynamically
const getCurrentIPAddress = async () => {
  // Try to get from AsyncStorage first
  const storedIP = await getStoredIPAddress();
  if (storedIP) {
    console.log('Using stored IP address:', storedIP);
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
};

// Function to get the correct API base URL
export const getApiBaseUrl = async () => {
  // Check for environment variable from EAS build
  if (process.env.API_BASE_URL) {
    console.log('Using environment API URL:', process.env.API_BASE_URL);
    return process.env.API_BASE_URL;
  }
  
  // Check NODE_ENV for production builds
  if (process.env.NODE_ENV === 'production') {
    console.log('Production NODE_ENV detected, using production API');
    return 'https://lashwa.com/api';
  }
  
  // For local development, use the computer's IP address
  if (__DEV__) {
    console.log('Development mode detected, using local IP');
    // Temporarily force production URL for testing in Expo Go
    return 'https://lashwa.com/api';
    // return 'http://192.168.0.116:3000/api';
  }
  
  // Fallback to production URL for any other case
  console.log('Fallback to production API');
  return 'https://lashwa.com/api';
};

// Create API instance with dynamic base URL
let api = null;

const createApiInstance = async () => {
  const API_BASE_URL = await getApiBaseUrl();
  
  console.log('Platform:', Platform.OS);
  console.log('Environment:', __DEV__ ? 'Development' : 'Production');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('API_BASE_URL:', process.env.API_BASE_URL || 'not set');
  console.log('Final API Base URL:', API_BASE_URL);
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'LashwaApp/1.0',
    },
    timeout: 30000, // 30 second timeout for slower database queries
  });
};

// Initialize API instance
const initializeApi = async () => {
  if (!api) {
    api = await createApiInstance();
    
    // Attach token if available
    api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('Request Headers:', config.headers);
      console.log('Request Data:', config.data);
      return config;
    });

    // Add response interceptor for better error handling
    api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        console.error('Error config:', error.config);
        console.error('Error response:', error.response);
        console.error('API Base URL used:', error.config?.baseURL);
        
        // Handle specific HTTP status codes
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || '';
          
          // Don't override specific error messages from the server
          if (message && (status === 401 || status === 403 || status === 404 || status === 409 || status === 429)) {
            throw error; // Let the original error pass through
          }
        }
        
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
  }
  return api;
};

// Get API instance (initialize if needed)
export const getApi = async () => {
  return await initializeApi();
};

// Helper functions
export const registerUser = async (userData) => {
  const apiInstance = await getApi();
  return apiInstance.post('/register', userData);
};
export const loginUser = async (userData) => {
  const apiInstance = await getApi();
  return apiInstance.post('/login', userData);
};
export const fetchMessages = async (params) => {
  const apiInstance = await getApi();
  return apiInstance.get('/messages', { params });
};
export const likeProfile = async (data) => {
  const apiInstance = await getApi();
  return apiInstance.post('/like-profile', data);
};
export const createMatch = async (data) => {
  const apiInstance = await getApi();
  return apiInstance.post('/create-match', data);
};
export const getUserDetails = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/users/${userId}`);
};
export const updateProfileVisibility = async (userId, visibilitySettings) => {
  const apiInstance = await getApi();
  return apiInstance.put(`/users/${userId}/visibility`, visibilitySettings);
};

export const updateProfile = async (userId, profileData) => {
  const apiInstance = await getApi();
  return apiInstance.put(`/users/${userId}/profile`, profileData);
};
export const fetchMatches = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/matches?userId=${userId}`);
};
export const fetchReceivedLikes = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/received-likes/${userId}`);
};
export const getUserMatches = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/get-matches/${userId}`);
};

export const deduplicateUser = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.post(`/deduplicate-user/${userId}`);
};

// Stats functions
export const getUserStats = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/user-stats/${userId}`);
};
export const trackProfileView = async (viewedUserId, viewerUserId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/track-profile-view', { viewedUserId, viewerUserId });
};

// Photo upload functions
export const uploadPhoto = async (imageBase64, userId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/upload-photo', { imageBase64, userId });
};
export const uploadPhotos = async (images, userId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/upload-photos', { images, userId });
};

export const updateUserPhotos = async (userId, imageUrls) => {
  const apiInstance = await getApi();
  return apiInstance.put(`/users/${userId}/photos`, { imageUrls });
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    console.log('Checking email:', email, 'at URL:', await getApiBaseUrl());
    const apiInstance = await getApi();
    const response = await apiInstance.post('/check-email', { email });
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
      return true; // Email already exists
    }
    throw err;
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const apiInstance = await getApi();
    const response = await apiInstance.get('/');
    console.log('API connection test successful:', response.data);
    return {
      success: true,
      data: response.data,
      url: apiInstance.defaults.baseURL
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      error: error.message,
      url: error.config?.baseURL || 'unknown'
    };
  }
};

// Notification functions - DISABLED: Endpoints not implemented on server
export const getNotifications = async (userId) => {
  // const apiInstance = await getApi();
  // return apiInstance.get(`/notifications/${userId}`);
  return { data: [] }; // Return empty array until backend implements notifications
};
export const markNotificationAsRead = async (userId, notificationId) => {
  // const apiInstance = await getApi();
  // return apiInstance.put(`/notifications/${userId}/${notificationId}/read`);
  return { data: { success: true } }; // Mock response
};
export const markAllNotificationsAsRead = async (userId) => {
  // const apiInstance = await getApi();
  // return apiInstance.put(`/notifications/${userId}/read-all`);
  return { data: { success: true } }; // Mock response
};
export const deleteNotification = async (userId, notificationId) => {
  // const apiInstance = await getApi();
  // return apiInstance.delete(`/notifications/${userId}/${notificationId}`);
  return { data: { success: true } }; // Mock response
};

// Block/Unblock functions
export const blockUser = async (userId, blockedUserId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/block-user', { userId, blockedUserId });
};
export const unblockUser = async (userId, blockedUserId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/unblock-user', { userId, blockedUserId });
};
export const getBlockedUsers = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/blocked-users/${userId}`);
};

// Report functions
export const reportUser = async (reporterId, reportedUserId, reason, description) => {
  const apiInstance = await getApi();
  return apiInstance.post('/report-user', { reporterId, reportedUserId, reason, description });
};
export const checkBlockedStatus = async (userId, otherUserId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/check-blocked-status/${userId}/${otherUserId}`);
};

// Reject functions
export const rejectProfile = async (userId, rejectedUserId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/reject-profile', { userId, rejectedUserId });
};
export const unrejectProfile = async (userId, rejectedUserId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/unreject-profile', { userId, rejectedUserId });
};
export const getRejectedProfiles = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/rejected-profiles/${userId}`);
};

// Debug functions
export const debugRejectionStatus = async (userId, otherUserId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/debug-rejection-status/${userId}/${otherUserId}`);
};
export const debugRejectedProfiles = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/debug-rejected-profiles/${userId}`);
};

// Account management functions
export const deactivateAccount = async (userId, password) => {
  const apiInstance = await getApi();
  return apiInstance.post('/deactivate-account', { userId, password });
};
export const reactivateAccount = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.post('/reactivate-account', { userId });
};
export const deleteAccount = async (userId, password) => {
  const apiInstance = await getApi();
  return apiInstance.post('/delete-account', { userId, password });
};
export const getAccountStatus = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/users/${userId}/account-status`);
};
export const getUserStatus = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/user-status/${userId}`);
}; 