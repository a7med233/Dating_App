import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // App lifecycle
  isAppReady: false,
  isFirstLaunch: true,
  appVersion: '1.0.0',
  buildNumber: '1',
  
  // Loading states
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,
  
  // Error handling
  error: null,
  errorMessage: '',
  showError: false,
  
  // Network state
  isOnline: true,
  isConnected: false,
  connectionType: null, // 'wifi' | 'cellular' | 'none'
  
  // App state
  currentScreen: null,
  previousScreen: null,
  navigationStack: [],
  
  // Permissions
  permissions: {
    camera: false,
    location: false,
    notifications: false,
    contacts: false,
    microphone: false,
    photoLibrary: false,
  },
  
  // App data
  lastSyncTime: null,
  dataVersion: 1,
  cacheVersion: 1,
  
  // User session
  sessionStartTime: null,
  lastActivityTime: null,
  sessionDuration: 0,
  
  // App preferences (cached)
  preferences: {
    autoLogin: true,
    rememberMe: true,
    biometricAuth: false,
    darkMode: false,
    language: 'en',
    region: 'US',
    timezone: 'UTC',
  },
  
  // Debug and development
  debug: {
    isDebugMode: false,
    showDebugInfo: false,
    logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug'
    performanceMetrics: {},
  },
  
  // App maintenance
  maintenance: {
    isUnderMaintenance: false,
    maintenanceMessage: '',
    maintenanceEndTime: null,
    forceUpdate: false,
    updateUrl: null,
  },
  
  // Analytics and tracking
  analytics: {
    sessionId: null,
    userId: null,
    events: [],
    lastEventTime: null,
  },
  
  // Feature flags
  features: {
    newChat: true,
    videoCalls: false,
    voiceMessages: true,
    stories: false,
    premiumFeatures: false,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // App lifecycle
    setAppReady: (state, action) => {
      state.isAppReady = action.payload;
    },
    setFirstLaunch: (state, action) => {
      state.isFirstLaunch = action.payload;
    },
    setAppVersion: (state, action) => {
      state.appVersion = action.payload;
    },
    
    // Loading states
    setLoading: (state, action) => {
      const { isLoading, message = '', progress = 0 } = action.payload;
      state.isLoading = isLoading;
      state.loadingMessage = message;
      state.loadingProgress = progress;
    },
    updateLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      const { error, message = '', show = true } = action.payload;
      state.error = error;
      state.errorMessage = message;
      state.showError = show;
    },
    clearError: (state) => {
      state.error = null;
      state.errorMessage = '';
      state.showError = false;
    },
    
    // Network state
    setNetworkStatus: (state, action) => {
      const { isOnline, isConnected, connectionType } = action.payload;
      state.isOnline = isOnline;
      state.isConnected = isConnected;
      state.connectionType = connectionType;
    },
    
    // App state
    setCurrentScreen: (state, action) => {
      state.previousScreen = state.currentScreen;
      state.currentScreen = action.payload;
      state.navigationStack.push(action.payload);
      
      // Keep only last 10 screens in stack
      if (state.navigationStack.length > 10) {
        state.navigationStack = state.navigationStack.slice(-10);
      }
    },
    clearNavigationStack: (state) => {
      state.navigationStack = [];
    },
    
    // Permissions
    updatePermission: (state, action) => {
      const { permission, granted } = action.payload;
      if (state.permissions.hasOwnProperty(permission)) {
        state.permissions[permission] = granted;
      }
    },
    updateAllPermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
    
    // App data
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload;
    },
    incrementDataVersion: (state) => {
      state.dataVersion += 1;
    },
    incrementCacheVersion: (state) => {
      state.cacheVersion += 1;
    },
    
    // User session
    startSession: (state) => {
      state.sessionStartTime = new Date().toISOString();
      state.lastActivityTime = new Date().toISOString();
      state.sessionDuration = 0;
    },
    updateLastActivity: (state) => {
      state.lastActivityTime = new Date().toISOString();
      if (state.sessionStartTime) {
        const startTime = new Date(state.sessionStartTime);
        const currentTime = new Date();
        state.sessionDuration = Math.floor((currentTime - startTime) / 1000); // in seconds
      }
    },
    endSession: (state) => {
      state.sessionStartTime = null;
      state.lastActivityTime = null;
      state.sessionDuration = 0;
    },
    
    // App preferences
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      if (state.preferences.hasOwnProperty(key)) {
        state.preferences[key] = value;
      }
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Debug and development
    setDebugMode: (state, action) => {
      state.debug.isDebugMode = action.payload;
    },
    setShowDebugInfo: (state, action) => {
      state.debug.showDebugInfo = action.payload;
    },
    setLogLevel: (state, action) => {
      state.debug.logLevel = action.payload;
    },
    addPerformanceMetric: (state, action) => {
      const { key, value } = action.payload;
      state.debug.performanceMetrics[key] = value;
    },
    
    // App maintenance
    setMaintenanceMode: (state, action) => {
      const { isUnderMaintenance, message = '', endTime = null, forceUpdate = false, updateUrl = null } = action.payload;
      state.maintenance.isUnderMaintenance = isUnderMaintenance;
      state.maintenance.maintenanceMessage = message;
      state.maintenance.maintenanceEndTime = endTime;
      state.maintenance.forceUpdate = forceUpdate;
      state.maintenance.updateUrl = updateUrl;
    },
    
    // Analytics and tracking
    setAnalyticsSession: (state, action) => {
      const { sessionId, userId } = action.payload;
      state.analytics.sessionId = sessionId;
      state.analytics.userId = userId;
    },
    addAnalyticsEvent: (state, action) => {
      state.analytics.events.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      state.analytics.lastEventTime = new Date().toISOString();
      
      // Keep only last 100 events
      if (state.analytics.events.length > 100) {
        state.analytics.events = state.analytics.events.slice(-100);
      }
    },
    clearAnalyticsEvents: (state) => {
      state.analytics.events = [];
    },
    
    // Feature flags
    updateFeatureFlag: (state, action) => {
      const { feature, enabled } = action.payload;
      if (state.features.hasOwnProperty(feature)) {
        state.features[feature] = enabled;
      }
    },
    updateFeatureFlags: (state, action) => {
      state.features = { ...state.features, ...action.payload };
    },
    
    // Reset app state (for logout)
    resetAppState: (state) => {
      return {
        ...initialState,
        isFirstLaunch: state.isFirstLaunch,
        appVersion: state.appVersion,
        buildNumber: state.buildNumber,
        preferences: state.preferences,
        debug: state.debug,
        maintenance: state.maintenance,
        features: state.features,
      };
    },
  },
});

export const {
  setAppReady,
  setFirstLaunch,
  setAppVersion,
  setLoading,
  updateLoadingProgress,
  setError,
  clearError,
  setNetworkStatus,
  setCurrentScreen,
  clearNavigationStack,
  updatePermission,
  updateAllPermissions,
  setLastSyncTime,
  incrementDataVersion,
  incrementCacheVersion,
  startSession,
  updateLastActivity,
  endSession,
  updatePreference,
  updatePreferences,
  setDebugMode,
  setShowDebugInfo,
  setLogLevel,
  addPerformanceMetric,
  setMaintenanceMode,
  setAnalyticsSession,
  addAnalyticsEvent,
  clearAnalyticsEvents,
  updateFeatureFlag,
  updateFeatureFlags,
  resetAppState,
} = appSlice.actions;

export default appSlice.reducer; 