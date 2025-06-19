import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper functions
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (userData) => api.post('/login', userData);
export const fetchMessages = (params) => api.get('/messages', { params });
export const likeProfile = (data) => api.post('/like-profile', data);
export const createMatch = (data) => api.post('/create-match', data);
export const getUserDetails = (userId) => api.get(`/users/${userId}`);
export const fetchMatches = (userId) => api.get(`/matches?userId=${userId}`);
export const fetchReceivedLikes = (userId) => api.get(`/received-likes/${userId}`);
export const getUserMatches = (userId) => api.get(`/get-matches/${userId}`);

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    await api.post('/check-email', { email });
    return false; // Email is available
  } catch (err) {
    if (err.response && err.response.status === 409) {
      return true; // Email exists
    }
    throw err;
  }
};

export default api; 