import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching potential matches
export const fetchPotentialMatches = createAsyncThunk(
  'matches/fetchPotential',
  async (_, { rejectWithValue }) => {
    try {
      // This would call your API to fetch potential matches
      // For now, we'll return a mock response
      return [
        {
          id: '1',
          name: 'Sarah',
          age: 24,
          photos: ['https://example.com/photo1.jpg'],
          bio: 'Love hiking and coffee',
          distance: 5,
          lastActive: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Emma',
          age: 26,
          photos: ['https://example.com/photo2.jpg'],
          bio: 'Adventure seeker',
          distance: 8,
          lastActive: new Date().toISOString(),
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching user matches
export const fetchUserMatches = createAsyncThunk(
  'matches/fetchUserMatches',
  async (_, { rejectWithValue }) => {
    try {
      // This would call your API to fetch user matches
      return [
        {
          id: '1',
          userId: '1',
          matchedUserId: '2',
          matchedUser: {
            id: '2',
            name: 'Sarah',
            age: 24,
            photos: ['https://example.com/photo1.jpg'],
            lastActive: new Date().toISOString(),
          },
          matchedAt: new Date().toISOString(),
          lastMessage: null,
          unreadCount: 0,
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for sending a like
export const sendLike = createAsyncThunk(
  'matches/sendLike',
  async ({ targetUserId, likeType = 'regular' }, { rejectWithValue }) => {
    try {
      // This would call your API to send a like
      return { targetUserId, likeType, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for handling a like
export const handleLike = createAsyncThunk(
  'matches/handleLike',
  async ({ likeId, action }, { rejectWithValue }) => {
    try {
      // This would call your API to handle a like (accept/reject)
      return { likeId, action, success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  potentialMatches: [],
  userMatches: [],
  receivedLikes: [],
  sentLikes: [],
  isLoading: false,
  error: null,
  currentIndex: 0,
  filters: {
    ageRange: { min: 18, max: 50 },
    distance: 25,
    gender: [],
  },
  stats: {
    totalLikes: 0,
    totalMatches: 0,
    totalSuperLikes: 0,
  },
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    nextProfile: (state) => {
      if (state.currentIndex < state.potentialMatches.length - 1) {
        state.currentIndex += 1;
      }
    },
    previousProfile: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    resetCurrentIndex: (state) => {
      state.currentIndex = 0;
    },
    addPotentialMatch: (state, action) => {
      state.potentialMatches.push(action.payload);
    },
    removePotentialMatch: (state, action) => {
      const index = state.potentialMatches.findIndex(
        match => match.id === action.payload
      );
      if (index !== -1) {
        state.potentialMatches.splice(index, 1);
      }
    },
    addMatch: (state, action) => {
      state.userMatches.push(action.payload);
      state.stats.totalMatches += 1;
    },
    removeMatch: (state, action) => {
      state.userMatches = state.userMatches.filter(
        match => match.id !== action.payload
      );
    },
    addReceivedLike: (state, action) => {
      state.receivedLikes.push(action.payload);
      state.stats.totalLikes += 1;
    },
    removeReceivedLike: (state, action) => {
      state.receivedLikes = state.receivedLikes.filter(
        like => like.id !== action.payload
      );
    },
    addSentLike: (state, action) => {
      state.sentLikes.push(action.payload);
    },
    updateMatchLastMessage: (state, action) => {
      const { matchId, message } = action.payload;
      const match = state.userMatches.find(m => m.id === matchId);
      if (match) {
        match.lastMessage = message;
      }
    },
    incrementUnreadCount: (state, action) => {
      const match = state.userMatches.find(m => m.id === action.payload);
      if (match) {
        match.unreadCount += 1;
      }
    },
    clearUnreadCount: (state, action) => {
      const match = state.userMatches.find(m => m.id === action.payload);
      if (match) {
        match.unreadCount = 0;
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch potential matches
      .addCase(fetchPotentialMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPotentialMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.potentialMatches = action.payload;
        state.currentIndex = 0;
      })
      .addCase(fetchPotentialMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user matches
      .addCase(fetchUserMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userMatches = action.payload;
      })
      .addCase(fetchUserMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send like
      .addCase(sendLike.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendLike.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the profile from potential matches
        state.potentialMatches = state.potentialMatches.filter(
          match => match.id !== action.payload.targetUserId
        );
        // Add to sent likes
        state.sentLikes.push({
          targetUserId: action.payload.targetUserId,
          likeType: action.payload.likeType,
          sentAt: new Date().toISOString(),
        });
      })
      .addCase(sendLike.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Handle like
      .addCase(handleLike.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleLike.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from received likes
        state.receivedLikes = state.receivedLikes.filter(
          like => like.id !== action.payload.likeId
        );
        // If accepted, add to matches
        if (action.payload.action === 'accept') {
          // This would typically add a new match
        }
      })
      .addCase(handleLike.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
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
  clearError,
} = matchesSlice.actions;

export default matchesSlice.reducer; 