import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStoredIPAddress } from '../utils/ipConfig';

// Function to get the current IP address dynamically
const getCurrentIPAddress = async () => {
  // Try to get from AsyncStorage first
  const storedIP = await getStoredIPAddress();
  if (storedIP && storedIP !== 'https://lashwa.com/api') {
    return storedIP;
  }
  
  // Fallback to environment variable if set
  if (process.env.NODE_ENV === 'production') {
    return 'https://lashwa.com/api';
  }
  
  // Return the stored default
  return storedIP || (process.env.NODE_ENV === 'production' ? 'https://lashwa.com/api' : 'https://lashwa.com/api');
};

// Function to get the correct API base URL
const getApiBaseUrl = async () => {
  return 'https://lashwa.com/api';
};

// Create API instance with dynamic base URL
let api = null;

const createApiInstance = async () => {
  const API_BASE_URL = await getApiBaseUrl();
  
  console.log('Platform:', Platform.OS);
  console.log('API Base URL:', API_BASE_URL);
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
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
      return config;
    });

    // Add response interceptor for better error handling
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        console.error('Error config:', error.config);
        console.error('Error response:', error.response);
        
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
    console.log('Testing API connection to:', await getApiBaseUrl());
    const apiInstance = await getApi();
    const response = await apiInstance.post('/check-email', { email: 'test@example.com' });
    console.log('API test successful:', response.data);
    return true;
  } catch (err) {
    console.error('API test failed:', err);
    return false;
  }
};

// Notification API endpoints
export const getNotifications = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/api/notifications/${userId}`);
};
export const markNotificationAsRead = async (userId, notificationId) => {
  const apiInstance = await getApi();
  return apiInstance.post(`/api/notifications/${userId}/read/${notificationId}`);
};
export const markAllNotificationsAsRead = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.post(`/api/notifications/${userId}/read-all`);
};
export const deleteNotification = async (userId, notificationId) => {
  const apiInstance = await getApi();
  return apiInstance.delete(`/api/notifications/${userId}/${notificationId}`);
};

// Block and Report functions
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

export const reportUser = async (reporterId, reportedUserId, reason, description) => {
  const apiInstance = await getApi();
  return apiInstance.post('/report-user', { reporterId, reportedUserId, reason, description });
};

export const checkBlockedStatus = async (userId, otherUserId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/check-blocked/${userId}/${otherUserId}`);
};

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

export const debugRejectionStatus = async (userId, otherUserId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/debug-rejection/${userId}/${otherUserId}`);
};

export const debugRejectedProfiles = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/debug-rejected-profiles/${userId}`);
};

// Account Management Functions
export const deactivateAccount = async (userId, password) => {
  const apiInstance = await getApi();
  return apiInstance.put(`/users/${userId}/deactivate`, { password });
};

export const reactivateAccount = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.put(`/users/${userId}/reactivate`);
};

export const deleteAccount = async (userId, password) => {
  const apiInstance = await getApi();
  return apiInstance.delete(`/users/${userId}/delete`, { data: { password } });
};

export const getAccountStatus = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/users/${userId}/account-status`);
};

export const getUserStatus = async (userId) => {
  const apiInstance = await getApi();
  return apiInstance.get(`/user-status/${userId}`);
};

export default getApi; 