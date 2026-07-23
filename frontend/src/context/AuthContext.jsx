import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || '1');
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);

  const login = (newUserId, newToken) => {
    localStorage.setItem('user_id', newUserId);
    localStorage.setItem('access_token', newToken);
    setUserId(newUserId);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ userId, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
