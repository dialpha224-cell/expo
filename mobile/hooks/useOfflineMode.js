import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { 
  cacheData, 
  getCachedData, 
  addToOfflineQueue, 
  getOfflineQueue, 
  removeFromOfflineQueue,
  CACHE_KEYS 
} from '../services/OfflineCache';
import axios from 'axios';

const API_URL = 'https://salon-dashboard-48.preview.emergentagent.com/api';

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      
      // Auto-sync when back online
      if (online) {
        syncOfflineQueue();
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    // Load pending actions count
    loadPendingCount();

    return () => unsubscribe();
  }, []);

  const loadPendingCount = async () => {
    const queue = await getOfflineQueue();
    setPendingActions(queue.length);
  };

  /**
   * Fetch data with offline support
   */
  const fetchWithCache = useCallback(async (endpoint, cacheKey, options = {}) => {
    const { forceFresh = false, cacheDuration } = options;

    // If online and not forcing cache, try to fetch fresh data
    if (isOnline && !forceFresh) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, { 
          withCredentials: true,
          timeout: 10000
        });
        
        // Cache the fresh data
        if (cacheKey) {
          await cacheData(cacheKey, response.data, cacheDuration);
        }
        
        return { data: response.data, fromCache: false, error: null };
      } catch (error) {
        console.log('Fetch failed, trying cache:', error.message);
      }
    }

    // Try to get from cache
    if (cacheKey) {
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return { data: cachedData, fromCache: true, error: null };
      }
    }

    return { data: null, fromCache: false, error: 'No data available' };
  }, [isOnline]);

  /**
   * Make a POST/PUT/DELETE request with offline queue support
   */
  const mutateWithQueue = useCallback(async (endpoint, method, data, options = {}) => {
    const { actionType, description } = options;

    // If online, try to execute immediately
    if (isOnline) {
      try {
        let response;
        const config = { withCredentials: true, timeout: 10000 };
        
        if (method === 'POST') {
          response = await axios.post(`${API_URL}${endpoint}`, data, config);
        } else if (method === 'PUT') {
          response = await axios.put(`${API_URL}${endpoint}`, data, config);
        } else if (method === 'DELETE') {
          response = await axios.delete(`${API_URL}${endpoint}`, config);
        }
        
        return { success: true, data: response.data, queued: false };
      } catch (error) {
        console.log('Mutation failed:', error.message);
        
        // If it's a network error, queue it
        if (error.code === 'ECONNABORTED' || !error.response) {
          await addToOfflineQueue({
            endpoint,
            method,
            data,
            actionType,
            description
          });
          await loadPendingCount();
          return { success: false, queued: true, error: 'Action saved for later sync' };
        }
        
        return { success: false, queued: false, error: error.message };
      }
    }

    // If offline, queue the action
    await addToOfflineQueue({
      endpoint,
      method,
      data,
      actionType,
      description
    });
    await loadPendingCount();
    
    return { success: false, queued: true, error: 'Action saved for later sync' };
  }, [isOnline]);

  /**
   * Sync offline queue when back online
   */
  const syncOfflineQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    const queue = await getOfflineQueue();
    
    let successCount = 0;
    let failCount = 0;
    
    for (const action of queue) {
      try {
        const config = { withCredentials: true, timeout: 15000 };
        
        if (action.method === 'POST') {
          await axios.post(`${API_URL}${action.endpoint}`, action.data, config);
        } else if (action.method === 'PUT') {
          await axios.put(`${API_URL}${action.endpoint}`, action.data, config);
        } else if (action.method === 'DELETE') {
          await axios.delete(`${API_URL}${action.endpoint}`, config);
        }
        
        await removeFromOfflineQueue(action.id);
        successCount++;
      } catch (error) {
        console.log('Sync failed for action:', action.id, error.message);
        failCount++;
      }
    }
    
    await loadPendingCount();
    setIsSyncing(false);
    
    return { successCount, failCount };
  }, [isOnline, isSyncing]);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    fetchWithCache,
    mutateWithQueue,
    syncOfflineQueue,
    refreshPendingCount: loadPendingCount
  };
};

export default useOfflineMode;
