import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching chat conversations
export const fetchChatConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      // This would call your API to fetch chat conversations
      return [
        {
          id: '1',
          matchId: '1',
          participants: ['user1', 'user2'],
          lastMessage: {
            id: 'msg1',
            text: 'Hey, how are you?',
            senderId: 'user2',
            timestamp: new Date().toISOString(),
            isRead: false,
          },
          unreadCount: 1,
          updatedAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching messages in a conversation
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      // This would call your API to fetch messages for a conversation
      return [
        {
          id: 'msg1',
          conversationId,
          text: 'Hey, how are you?',
          senderId: 'user2',
          timestamp: new Date().toISOString(),
          isRead: true,
          type: 'text',
        },
        {
          id: 'msg2',
          conversationId,
          text: 'I\'m good, thanks! How about you?',
          senderId: 'user1',
          timestamp: new Date().toISOString(),
          isRead: true,
          type: 'text',
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for sending a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, text, type = 'text' }, { rejectWithValue }) => {
    try {
      // This would call your API to send a message
      const message = {
        id: Date.now().toString(),
        conversationId,
        text,
        senderId: 'user1', // Current user ID
        timestamp: new Date().toISOString(),
        isRead: false,
        type,
      };
      return message;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,
  typingUsers: {},
  onlineUsers: [],
  selectedConversationId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.selectedConversationId = action.payload?.id || null;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
      
      // Update conversation's last message
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.timestamp;
      }
    },
    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
        if (conversation.lastMessage) {
          conversation.lastMessage.isRead = true;
        }
      }
      
      // Mark all messages in the conversation as read
      const messages = state.messages[conversationId];
      if (messages) {
        messages.forEach(message => {
          message.isRead = true;
        });
      }
    },
    setTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        c => c.id !== action.payload
      );
      delete state.messages[action.payload];
    },
    updateConversation: (state, action) => {
      const { id, updates } = action.payload;
      const conversation = state.conversations.find(c => c.id === id);
      if (conversation) {
        Object.assign(conversation, updates);
      }
    },
    clearMessages: (state, action) => {
      const conversationId = action.payload;
      state.messages[conversationId] = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchChatConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchChatConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const conversationId = action.meta.arg;
        state.messages[conversationId] = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversationId } = action.meta.arg;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(action.payload);
        
        // Update conversation's last message
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.lastMessage = action.payload;
          conversation.updatedAt = action.payload.timestamp;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
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
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer; 