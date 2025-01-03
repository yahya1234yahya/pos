'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth.php`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth.php`,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setError(null);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  // RFID login function
  const loginWithRFID = async (rfid) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth.php`,
        { rfid },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setError(null);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/logout.php`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    loginWithRFID,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
