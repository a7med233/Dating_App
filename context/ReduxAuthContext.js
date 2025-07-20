import React, { createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  checkAuthStatus, 
  loginUser, 
  logoutUser, 
  setToken, 
  setUser,
  clearError 
} from '../store/slices/authSlice';
import { AppState } from 'react-native';

const ReduxAuthContext = createContext();

export const useReduxAuth = () => {
  const context = useContext(ReduxAuthContext);
  if (!context) {
    throw new Error('useReduxAuth must be used within a ReduxAuthProvider');
  }
  return context;
};

export const ReduxAuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Check authentication status on mount and monitor app state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
        const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
        
        if (storedToken) {
          // Check if session has expired (if keep logged in is false)
          if (keepLoggedIn === 'false' && sessionExpiry) {
            const expiryDate = new Date(sessionExpiry);
            const now = new Date();
            
            if (now > expiryDate) {
              // Session has expired, clear all auth data
              console.log('Session expired, clearing auth data');
              await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
              return;
            }
          }
          
          await dispatch(checkAuthStatus(storedToken));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    const checkSessionExpiry = async () => {
      try {
        const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
        const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
        
        if (keepLoggedIn === 'false' && sessionExpiry) {
          const expiryDate = new Date(sessionExpiry);
          const now = new Date();
          
          if (now > expiryDate) {
            // Session has expired, clear all auth data
            console.log('Session expired on app foreground, clearing auth data');
            await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
            await dispatch(logoutUser()).unwrap();
          }
        }
      } catch (error) {
        console.error('Error checking session expiry:', error);
      }
    };

    checkAuth();
    
    // Listen for app state changes to check session expiry
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App has come to foreground, check session expiry
        checkSessionExpiry();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [dispatch]);

  // Login function
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      if (result.token) {
        await AsyncStorage.setItem('token', result.token);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'keepLoggedIn', 'sessionExpiry']);
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Set token manually (for backward compatibility)
  const setTokenManually = async (newToken) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('token', newToken);
        dispatch(setToken(newToken));
        await dispatch(checkAuthStatus(newToken));
      } else {
        await AsyncStorage.removeItem('token');
        dispatch(setToken(null));
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  };

  // Set user manually (for backward compatibility)
  const setUserManually = (userData) => {
    dispatch(setUser(userData));
  };

  // Clear error
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Extend session function
  const extendSession = async () => {
    try {
      const keepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
      if (keepLoggedIn === 'false') {
        // Extend session by 24 hours from now
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await AsyncStorage.setItem('sessionExpiry', sessionExpiry);
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setToken: setTokenManually,
    setUser: setUserManually,
    clearError: clearAuthError,
    extendSession,
  };

  return (
    <ReduxAuthContext.Provider value={value}>
      {children}
    </ReduxAuthContext.Provider>
  );
}; 