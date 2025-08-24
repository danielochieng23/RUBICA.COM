import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    const storedIdentity = localStorage.getItem('identity');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    }
    
    setLoading(false);
  }, []);

  const login = (userData, identityData) => {
    setUser(userData);
    setIdentity(identityData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('identity', JSON.stringify(identityData));
    toast.success('Successfully logged in!');
  };

  const logout = () => {
    setUser(null);
    setIdentity(null);
    localStorage.removeItem('user');
    localStorage.removeItem('identity');
    localStorage.removeItem('authToken');
    toast.info('Logged out successfully');
  };

  const updateIdentity = (newIdentityData) => {
    setIdentity(newIdentityData);
    localStorage.setItem('identity', JSON.stringify(newIdentityData));
  };

  const value = {
    user,
    identity,
    loading,
    login,
    logout,
    updateIdentity,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};