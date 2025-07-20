// Export all slices
export { default as authSlice } from './authSlice';
export { default as userSlice } from './userSlice';
export { default as matchesSlice } from './matchesSlice';
export { default as chatSlice } from './chatSlice';
export { default as notificationsSlice } from './notificationsSlice';
export { default as settingsSlice } from './settingsSlice';
export { default as appSlice } from './appSlice';

// Export auth actions
export {
  checkAuthStatus,
  loginUser,
  logoutUser,
  setToken,
  setUser,
  setLoading,
  clearError,
  updateUserProfile,
  setSessionExpiry,
} from './authSlice';

// Export user actions
export {
  fetchUserProfile,
  updateUserProfile,
  setProfile,
  updateProfileField,
  setPreferences,
  setSettings,
  setOnboardingStep,
  completeOnboarding,
  addPhoto,
  removePhoto,
  reorderPhotos,
  updateLastActive,
} from './userSlice';

// Export matches actions
export {
  fetchPotentialMatches,
  fetchUserMatches,
  sendLike,
  handleLike,
  setCurrentIndex,
  nextProfile,
  previousProfile,
  resetCurrentIndex,
  addPotentialMatch,
  removePotentialMatch,
  addMatch,
  removeMatch,
  addReceivedLike,
  removeReceivedLike,
  addSentLike,
  updateMatchLastMessage,
  incrementUnreadCount,
  clearUnreadCount,
  setFilters,
  updateStats,
} from './matchesSlice';

// Export chat actions
export {
  fetchChatConversations,
  fetchMessages,
  sendMessage,
  setCurrentConversation,
  addMessage,
  updateMessageStatus,
  markConversationAsRead,
  setTypingStatus,
  setOnlineUsers,
  addConversation,
  removeConversation,
  updateConversation,
  clearMessages,
} from './chatSlice';

// Export notifications actions
export {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  updateNotificationSettings,
  updateBadgeCount,
  clearBadges,
  clearNotifications,
} from './notificationsSlice';

// Export settings actions
export {
  setTheme,
  setLanguage,
  setFontSize,
  updatePrivacySettings,
  updateDiscoverySettings,
  updateNotificationSettings as updateSettingsNotificationSettings,
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
} from './settingsSlice';

// Export app actions
export {
  setAppReady,
  setFirstLaunch,
  setAppVersion,
  setLoading as setAppLoading,
  updateLoadingProgress,
  setError as setAppError,
  clearError as clearAppError,
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
  updatePreferences as updateAppPreferences,
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
} from './appSlice'; 