import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('session_token');
      const storedUser = await SecureStore.getItemAsync('user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data);
        } catch (error) {
          // Token invalid, clear storage
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // Open Google OAuth in browser
      const redirectUrl = 'afrocrown://auth/callback';
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        // Extract session_id from URL
        const url = new URL(result.url);
        const sessionId = url.searchParams.get('session_id') || 
                          result.url.match(/session_id=([^&]+)/)?.[1];
        
        if (sessionId) {
          // Exchange session_id for token
          const response = await axios.post(`${API_URL}/auth/session`, {
            session_id: sessionId
          });
          
          const userData = response.data;
          const sessionToken = response.headers['set-cookie']?.[0]?.match(/session_token=([^;]+)/)?.[1] || sessionId;
          
          // Store credentials
          await SecureStore.setItemAsync('session_token', sessionToken);
          await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
          
          setToken(sessionToken);
          setUser(userData);
          
          return userData;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('session_token');
      await SecureStore.deleteItemAsync('user_data');
      setToken(null);
      setUser(null);
    }
  };

  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, api, token }}>
      {children}
    </AuthContext.Provider>
  );
};
