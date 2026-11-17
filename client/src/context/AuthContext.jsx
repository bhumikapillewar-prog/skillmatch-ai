import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillmatch_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.data.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data.token) {
        localStorage.setItem('skillmatch_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, headline) => {
    setAuthError(null);
    try {
      const res = await api.register(name, email, password, headline);
      if (res.success && res.data.token) {
        localStorage.setItem('skillmatch_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('skillmatch_token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
