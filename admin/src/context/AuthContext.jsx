import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    if (token && !admin) {
      setLoading(true);
      fetch('http://localhost:3000/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAdmin(data.admin);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [token, admin]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    if (admin) localStorage.setItem('admin', JSON.stringify(admin));
    else localStorage.removeItem('admin');
  }, [token, admin]);

  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch('http://localhost:3000/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setAdmin({ email, role: data.role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify({ email, role: data.role }));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 