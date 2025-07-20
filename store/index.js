import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import matchesSlice from './slices/matchesSlice';
import chatSlice from './slices/chatSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';
import appSlice from './slices/appSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    matches: matchesSlice,
    chat: chatSlice,
    notifications: notificationsSlice,
    settings: settingsSlice,
    app: appSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.lastLoginTime', 'app.lastSyncTime'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Export the store for use in the app
export default store; 