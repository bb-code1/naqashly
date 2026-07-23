import React, { createContext, useContext, useState } from 'react';
import { client } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_profile');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);

  const login = async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;

    const userProfile = {
      userId: userData?.id,
      email: userData?.email || email,
      username: userData?.name || email.split('@')[0]
    };

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', String(userProfile.userId));
    localStorage.setItem('user_profile', JSON.stringify(userProfile));

    setToken(access_token);
    setUser(userProfile);
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await client.post('/auth/register', { name: username, username, email, password });
    return response.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await client.post('/auth/logout');
      }
    } catch (err) {
      console.warn('[AuthContext] Error blacklisting token on logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_profile');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
