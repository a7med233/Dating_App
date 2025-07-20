import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // App settings
  theme: 'light', // 'light' | 'dark' | 'system'
  language: 'en',
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  
  // Privacy settings
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showDistance: true,
    showAge: true,
    showProfileTo: 'everyone', // 'everyone' | 'matches' | 'none'
    allowMessagesFrom: 'matches', // 'everyone' | 'matches' | 'none'
  },
  
  // Discovery settings
  discovery: {
    showMe: true,
    ageRange: { min: 18, max: 50 },
    distance: 25, // in miles/km
    gender: [], // array of preferred genders
    datingType: 'serious', // 'casual' | 'serious' | 'friendship'
    lookingFor: 'relationship', // 'relationship' | 'friendship' | 'casual'
  },
  
  // Notification settings
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    newMatches: true,
    messages: true,
    likes: true,
    superLikes: true,
    matches: true,
    marketing: false,
  },
  
  // Account settings
  account: {
    email: '',
    phone: '',
    isEmailVerified: false,
    isPhoneVerified: false,
    twoFactorAuth: false,
    accountType: 'free', // 'free' | 'premium' | 'gold'
    subscriptionEndDate: null,
  },
  
  // Data and storage
  data: {
    autoSavePhotos: true,
    saveChatHistory: true,
    dataUsage: 'standard', // 'low' | 'standard' | 'high'
    cacheSize: 0,
    lastCleanup: null,
  },
  
  // Safety and blocking
  safety: {
    blockList: [],
    reportList: [],
    autoBlockKeywords: [],
    safeMode: true,
    locationSharing: 'matches', // 'everyone' | 'matches' | 'none'
  },
  
  // App preferences
  preferences: {
    soundEnabled: true,
    vibrationEnabled: true,
    hapticFeedback: true,
    autoPlayVideos: true,
    showAnimations: true,
    compactMode: false,
  },
  
  // Subscription and billing
  subscription: {
    plan: 'free',
    status: 'active',
    nextBillingDate: null,
    paymentMethod: null,
    billingHistory: [],
  },
  
  // Support and help
  support: {
    lastContactDate: null,
    ticketHistory: [],
    faqViewed: [],
    tutorialCompleted: false,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    
    // Privacy settings
    updatePrivacySettings: (state, action) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    
    // Discovery settings
    updateDiscoverySettings: (state, action) => {
      state.discovery = { ...state.discovery, ...action.payload };
    },
    
    // Notification settings
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    // Account settings
    updateAccountSettings: (state, action) => {
      state.account = { ...state.account, ...action.payload };
    },
    
    // Data settings
    updateDataSettings: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    
    // Safety settings
    updateSafetySettings: (state, action) => {
      state.safety = { ...state.safety, ...action.payload };
    },
    
    // App preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Subscription settings
    updateSubscriptionSettings: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    
    // Support settings
    updateSupportSettings: (state, action) => {
      state.support = { ...state.support, ...action.payload };
    },
    
    // Block user
    blockUser: (state, action) => {
      const userId = action.payload;
      if (!state.safety.blockList.includes(userId)) {
        state.safety.blockList.push(userId);
      }
    },
    
    // Unblock user
    unblockUser: (state, action) => {
      const userId = action.payload;
      state.safety.blockList = state.safety.blockList.filter(id => id !== userId);
    },
    
    // Report user
    reportUser: (state, action) => {
      const { userId, reason } = action.payload;
      state.safety.reportList.push({ userId, reason, date: new Date().toISOString() });
    },
    
    // Add blocked keyword
    addBlockedKeyword: (state, action) => {
      const keyword = action.payload;
      if (!state.safety.autoBlockKeywords.includes(keyword)) {
        state.safety.autoBlockKeywords.push(keyword);
      }
    },
    
    // Remove blocked keyword
    removeBlockedKeyword: (state, action) => {
      const keyword = action.payload;
      state.safety.autoBlockKeywords = state.safety.autoBlockKeywords.filter(
        k => k !== keyword
      );
    },
    
    // Update cache size
    updateCacheSize: (state, action) => {
      state.data.cacheSize = action.payload;
    },
    
    // Mark tutorial as completed
    completeTutorial: (state) => {
      state.support.tutorialCompleted = true;
    },
    
    // Add FAQ to viewed list
    markFaqAsViewed: (state, action) => {
      const faqId = action.payload;
      if (!state.support.faqViewed.includes(faqId)) {
        state.support.faqViewed.push(faqId);
      }
    },
    
    // Add billing history entry
    addBillingHistoryEntry: (state, action) => {
      state.subscription.billingHistory.push(action.payload);
    },
    
    // Reset settings to default
    resetToDefaults: (state) => {
      return {
        ...initialState,
        account: state.account, // Preserve account info
        subscription: state.subscription, // Preserve subscription
        safety: state.safety, // Preserve safety settings
      };
    },
    
    // Import settings
    importSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    
    // Export settings (this would be handled by a selector)
    exportSettings: (state) => {
      // This is just a placeholder - actual export would be handled by a selector
      return state;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setFontSize,
  updatePrivacySettings,
  updateDiscoverySettings,
  updateNotificationSettings,
  updateAccountSettings,
  updateDataSettings,
  updateSafetySettings,
  updatePreferences,
  updateSubscriptionSettings,
  updateSupportSettings,
  blockUser,
  unblockUser,
  reportUser,
  addBlockedKeyword,
  removeBlockedKeyword,
  updateCacheSize,
  completeTutorial,
  markFaqAsViewed,
  addBillingHistoryEntry,
  resetToDefaults,
  importSettings,
  exportSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 