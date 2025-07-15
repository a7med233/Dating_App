import { environment } from './environment.js';

// API Configuration for Admin Panel
const API_CONFIG = {
  // Base URL - will be overridden by environment variables
  BASE_URL: environment.API_BASE_URL,
  TIMEOUT: environment.API_TIMEOUT,
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/admin/login',
    ME: '/admin/me',
    REGISTER: '/admin/register',
    
    // Users
    USERS: '/admin/users',
    USER_DETAILS: (id) => `/admin/users/${id}`,
    USER_BAN: (id) => `/admin/users/${id}/ban`,
    USER_MATCHES: (id) => `/admin/users/${id}/matches`,
    USER_MESSAGES: (id) => `/admin/users/${id}/messages`,
    USER_REPORTS: (id) => `/admin/users/${id}/reports`,
    
    // Reports
    REPORTS: '/admin/reports',
    REPORT_DETAILS: (id) => `/admin/reports/${id}`,
    REPORT_STATS: '/admin/reports/stats',
    
    // Analytics
    ANALYTICS: '/admin/analytics',
    STATS: '/admin/stats',
    
    // Support
    SUPPORT_CHATS: '/admin/support-chats',
    SUPPORT_CHAT: (id) => `/admin/support-chats/${id}`,
    
    // Notifications
    NOTIFICATIONS: '/admin/notifications',
    SEND_NOTIFICATION: '/admin/notifications/send',
    
    // Subscriptions
    SUBSCRIPTIONS: '/admin/subscriptions',
    SUBSCRIPTION_DETAILS: (id) => `/admin/subscriptions/${id}`,
  }
};

// API Client with error handling and authentication
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Create headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Make API request with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export API functions
export const api = {
  // Auth
  login: (credentials) => apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials),
  getMe: () => apiClient.get(API_CONFIG.ENDPOINTS.ME),
  registerAdmin: (adminData) => apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, adminData),
  
  // Users
  getUsers: (params) => apiClient.get(API_CONFIG.ENDPOINTS.USERS, params),
  getUserDetails: (id) => apiClient.get(API_CONFIG.ENDPOINTS.USER_DETAILS(id)),
  deleteUser: (id) => apiClient.delete(API_CONFIG.ENDPOINTS.USER_DETAILS(id)),
  banUser: (id, banData) => apiClient.patch(API_CONFIG.ENDPOINTS.USER_BAN(id), banData),
  getUserMatches: (id) => apiClient.get(API_CONFIG.ENDPOINTS.USER_MATCHES(id)),
  getUserMessages: (id) => apiClient.get(API_CONFIG.ENDPOINTS.USER_MESSAGES(id)),
  getUserReports: (id) => apiClient.get(API_CONFIG.ENDPOINTS.USER_REPORTS(id)),
  
  // Reports
  getReports: (params) => apiClient.get(API_CONFIG.ENDPOINTS.REPORTS, params),
  getReportDetails: (id) => apiClient.get(API_CONFIG.ENDPOINTS.REPORT_DETAILS(id)),
  updateReport: (id, data) => apiClient.patch(API_CONFIG.ENDPOINTS.REPORT_DETAILS(id), data),
  getReportStats: () => apiClient.get(API_CONFIG.ENDPOINTS.REPORT_STATS),
  
  // Analytics
  getAnalytics: () => apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS),
  getStats: () => apiClient.get(API_CONFIG.ENDPOINTS.STATS),
  
  // Support
  getSupportChats: () => apiClient.get(API_CONFIG.ENDPOINTS.SUPPORT_CHATS),
  getSupportChat: (id) => apiClient.get(API_CONFIG.ENDPOINTS.SUPPORT_CHAT(id)),
  updateSupportChat: (id, data) => apiClient.patch(API_CONFIG.ENDPOINTS.SUPPORT_CHAT(id), data),
  
  // Notifications
  getNotifications: () => apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS),
  sendNotification: (data) => apiClient.post(API_CONFIG.ENDPOINTS.SEND_NOTIFICATION, data),
  
  // Subscriptions
  getSubscriptions: () => apiClient.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS),
  getSubscriptionDetails: (id) => apiClient.get(API_CONFIG.ENDPOINTS.SUBSCRIPTION_DETAILS(id)),
};

export default api; 