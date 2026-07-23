import React, { createContext, useContext, useState, useEffect } from 'react';
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
    const { token: jwtToken, userId, email: userEmail, username } = response.data;

    const userProfile = { userId, email: userEmail, username: username || userEmail.split('@')[0] };

    localStorage.setItem('access_token', jwtToken);
    localStorage.setItem('user_id', String(userId));
    localStorage.setItem('user_profile', JSON.stringify(userProfile));

    setToken(jwtToken);
    setUser(userProfile);
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await client.post('/auth/register', { username, email, password });
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
