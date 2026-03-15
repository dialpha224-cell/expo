import { useEffect, useState, createContext, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform, Alert } from 'react-native';

// API Configuration
const API_URL = 'https://salon-dashboard-48.preview.emergentagent.com/api';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    checkAuth();
    registerForPushNotifications();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Cookie: `session_token=${token}` },
          withCredentials: true,
        });
        setUser(response.data);
      }
    } catch (error) {
      console.log('Not authenticated');
      await AsyncStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      
      setExpoPushToken(token.data);
      
      const sessionToken = await AsyncStorage.getItem('session_token');
      if (sessionToken) {
        await axios.post(
          `${API_URL}/notifications/register-token`,
          { expo_push_token: token.data },
          { headers: { Cookie: `session_token=${sessionToken}` } }
        );
      }
    } catch (error) {
      console.log('Error registering for push notifications:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = response.data;
      
      await AsyncStorage.setItem('session_token', 'logged_in');
      setUser(userData);
      
      if (expoPushToken) {
        await axios.post(
          `${API_URL}/notifications/register-token`,
          { expo_push_token: expoPushToken },
          { withCredentials: true }
        );
      }
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      }
    } catch (error) {
      console.log('Logout error:', error);
    }
    await AsyncStorage.removeItem('session_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, API_URL }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[salonId]" options={{ title: 'Reserver' }} />
        <Stack.Screen name="salon/[id]" options={{ title: 'Details du salon' }} />
      </Stack>
    </AuthContext.Provider>
  );
}
