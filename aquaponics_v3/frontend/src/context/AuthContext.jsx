import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aq_token'));
  const [loading, setLoading] = useState(true);

  // Attach token to all axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('aq_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('aq_token');
    }
  }, [token]);

  // Fetch current user on load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_BASE}/auth/me`);
        setUser(res.data.data);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.data);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    setToken(res.data.token);
    setUser(res.data.data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await axios.put(`${API_BASE}/auth/profile`, data);
    setUser(res.data.data);
    return res.data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const res = await axios.put(`${API_BASE}/auth/change-password`, { currentPassword, newPassword });
    setToken(res.data.token);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
