import { useEffect, useState, createContext, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform, Alert, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import OfflineStatusBar from '../components/OfflineStatusBar';
import { cacheData, getCachedData, CACHE_KEYS } from '../services/OfflineCache';

// API Configuration
const API_URL = 'https://salon-dashboard-48.preview.emergentagent.com/api';

// Auth Context
const AuthContext = createContext(null);

// Offline Context
const OfflineContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useOffline = () => useContext(OfflineContext);

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
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkAuth();
    registerForPushNotifications();
    setupNetworkListener();
    loadPendingActions();
  }, []);

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);
      
      if (online) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  };

  const loadPendingActions = async () => {
    try {
      const queue = await getCachedData(CACHE_KEYS.OFFLINE_QUEUE) || [];
      setPendingActions(queue.length);
    } catch (error) {
      console.log('Error loading pending actions:', error);
    }
  };

  const syncOfflineData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      const queue = await getCachedData(CACHE_KEYS.OFFLINE_QUEUE) || [];
      // Sync logic here - for now just clear after sync attempt
      if (queue.length > 0) {
        console.log('Syncing', queue.length, 'offline actions');
        // Process queue...
        await cacheData(CACHE_KEYS.OFFLINE_QUEUE, [], 7 * 24 * 60 * 60 * 1000);
        setPendingActions(0);
      }
    } catch (error) {
      console.log('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkAuth = async () => {
    try {
      // First try to get cached user data
      const cachedUser = await getCachedData(CACHE_KEYS.USER_PROFILE);
      if (cachedUser) {
        setUser(cachedUser);
      }

      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Cookie: `session_token=${token}` },
            withCredentials: true,
            timeout: 10000,
          });
          setUser(response.data);
          // Cache user data for offline access
          await cacheData(CACHE_KEYS.USER_PROFILE, response.data, 24 * 60 * 60 * 1000);
        } catch (error) {
          // If network error, use cached data
          if (error.code === 'ECONNABORTED' || !error.response) {
            console.log('Network error, using cached user data');
          } else {
            console.log('Auth check failed:', error.message);
            await AsyncStorage.removeItem('session_token');
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.log('Auth check error:', error);
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

      // Note: projectId sera configure automatiquement par EAS
      const token = await Notifications.getExpoPushTokenAsync();
      
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
      if (token && isOnline) {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      }
    } catch (error) {
      console.log('Logout error:', error);
    }
    await AsyncStorage.removeItem('session_token');
    await cacheData(CACHE_KEYS.USER_PROFILE, null, 0); // Clear cached user
    setUser(null);
  };

  const offlineContextValue = {
    isOnline,
    pendingActions,
    isSyncing,
    syncOfflineData,
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, API_URL, isOnline }}>
      <OfflineContext.Provider value={offlineContextValue}>
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <StatusBar style="light" />
          {/* Offline Status Bar */}
          <OfflineStatusBar 
            isOnline={isOnline}
            pendingActions={pendingActions}
            isSyncing={isSyncing}
            onSync={syncOfflineData}
          />
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
        </View>
      </OfflineContext.Provider>
    </AuthContext.Provider>
  );
}
