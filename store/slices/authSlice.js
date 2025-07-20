import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { getAccountStatus } from '../../services/api';

// Async thunk for checking authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return { isAuthenticated: false, user: null };
      }

      const decodedToken = jwtDecode(token);
      const accountStatus = await getAccountStatus(decodedToken.userId);
      
      if (accountStatus.status === 200) {
        const { isActive, isDeleted } = accountStatus.data;
        
        if (isDeleted || !isActive) {
          return { isAuthenticated: false, user: null };
        }
      }

      return { 
        isAuthenticated: true, 
        user: decodedToken,
        token 
      };
    } catch (error) {
      return rejectWithValue({ isAuthenticated: false, user: null });
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // This would typically call your login API
      // For now, we'll assume the token is passed in credentials
      const { token } = credentials;
      const decodedToken = jwtDecode(token);
      
      return {
        token,
        user: decodedToken,
        isAuthenticated: true
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear any stored data
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastLoginTime: null,
  sessionExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.isAuthenticated) {
          state.lastLoginTime = new Date().toISOString();
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.lastLoginTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.lastLoginTime = null;
        state.sessionExpiry = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setToken,
  setUser,
  setLoading,
  clearError,
  updateUserProfile,
  setSessionExpiry,
} = authSlice.actions;

export default authSlice.reducer; 