import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify token and get admin info on mount
  useEffect(() => {
    if (token && !admin) {
      verifyToken();
    }
  }, [token, admin]);

  // Save/remove token and admin from localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('admin');
    }
  }, [token, admin]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getMe();
      setAdmin(data.admin);
    } catch (err) {
      console.error('Token verification failed:', err);
      setError(err.message);
      // Clear invalid token
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.login({ email, password });
      setToken(data.token);
      setAdmin({ email, role: data.role });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    setError('');
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  };

  const clearError = () => {
    setError('');
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      token, 
      login, 
      logout, 
      loading, 
      error, 
      clearError,
      isAuthenticated: !!token && !!admin 
    }}>
      {children}
    </AuthContext.Provider>
  );
} 