import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // This would call your API to fetch notifications
      return [
        {
          id: '1',
          type: 'new_match',
          title: 'New Match!',
          message: 'You matched with Sarah!',
          data: {
            matchId: '1',
            userId: '2',
            userName: 'Sarah',
          },
          isRead: false,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'new_message',
          title: 'New Message',
          message: 'Sarah sent you a message',
          data: {
            conversationId: '1',
            messageId: 'msg1',
          },
          isRead: false,
          timestamp: new Date().toISOString(),
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for marking notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      // This would call your API to mark notification as read
      return { notificationId, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for marking all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      // This would call your API to mark all notifications as read
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    newMatches: true,
    messages: true,
    likes: true,
    superLikes: true,
    matches: true,
  },
  badges: {
    total: 0,
    matches: 0,
    messages: 0,
    likes: 0,
    notifications: 0,
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
        state.badges.total += 1;
        
        // Update specific badge counts
        switch (action.payload.type) {
          case 'new_match':
            state.badges.matches += 1;
            break;
          case 'new_message':
            state.badges.messages += 1;
            break;
          case 'new_like':
            state.badges.likes += 1;
            break;
          default:
            state.badges.notifications += 1;
        }
      }
    },
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
        state.badges.total -= 1;
        
        // Update specific badge counts
        switch (notification.type) {
          case 'new_match':
            state.badges.matches = Math.max(0, state.badges.matches - 1);
            break;
          case 'new_message':
            state.badges.messages = Math.max(0, state.badges.messages - 1);
            break;
          case 'new_like':
            state.badges.likes = Math.max(0, state.badges.likes - 1);
            break;
          default:
            state.badges.notifications = Math.max(0, state.badges.notifications - 1);
        }
      }
      
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
        state.badges.total -= 1;
        
        // Update specific badge counts
        switch (notification.type) {
          case 'new_match':
            state.badges.matches = Math.max(0, state.badges.matches - 1);
            break;
          case 'new_message':
            state.badges.messages = Math.max(0, state.badges.messages - 1);
            break;
          case 'new_like':
            state.badges.likes = Math.max(0, state.badges.likes - 1);
            break;
          default:
            state.badges.notifications = Math.max(0, state.badges.notifications - 1);
        }
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
      state.badges = {
        total: 0,
        matches: 0,
        messages: 0,
        likes: 0,
        notifications: 0,
      };
    },
    updateNotificationSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateBadgeCount: (state, action) => {
      const { type, count } = action.payload;
      if (type === 'total') {
        state.badges.total = count;
      } else if (state.badges.hasOwnProperty(type)) {
        state.badges[type] = count;
      }
    },
    clearBadges: (state) => {
      state.badges = {
        total: 0,
        matches: 0,
        messages: 0,
        likes: 0,
        notifications: 0,
      };
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.badges = {
        total: 0,
        matches: 0,
        messages: 0,
        likes: 0,
        notifications: 0,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        
        // Calculate badge counts
        const badges = {
          total: 0,
          matches: 0,
          messages: 0,
          likes: 0,
          notifications: 0,
        };
        
        action.payload.forEach(notification => {
          if (!notification.isRead) {
            badges.total += 1;
            switch (notification.type) {
              case 'new_match':
                badges.matches += 1;
                break;
              case 'new_message':
                badges.messages += 1;
                break;
              case 'new_like':
                badges.likes += 1;
                break;
              default:
                badges.notifications += 1;
            }
          }
        });
        
        state.badges = badges;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount -= 1;
          state.badges.total -= 1;
          
          // Update specific badge counts
          switch (notification.type) {
            case 'new_match':
              state.badges.matches = Math.max(0, state.badges.matches - 1);
              break;
            case 'new_message':
              state.badges.messages = Math.max(0, state.badges.messages - 1);
              break;
            case 'new_like':
              state.badges.likes = Math.max(0, state.badges.likes - 1);
              break;
            default:
              state.badges.notifications = Math.max(0, state.badges.notifications - 1);
          }
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
        state.badges = {
          total: 0,
          matches: 0,
          messages: 0,
          likes: 0,
          notifications: 0,
        };
      });
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  updateNotificationSettings,
  updateBadgeCount,
  clearBadges,
  clearNotifications,
  clearError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer; 