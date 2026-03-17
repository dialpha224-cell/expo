import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@afrocrown_cache_';
const CACHE_EXPIRY_PREFIX = '@afrocrown_expiry_';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Keys for offline data
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_APPOINTMENTS: 'user_appointments',
  FAVORITE_SALONS: 'favorite_salons',
  RECENT_BOOKINGS: 'recent_bookings',
  SALONS_LIST: 'salons_list',
  TRENDS: 'trends',
  OFFLINE_QUEUE: 'offline_queue', // For actions to sync when online
};

/**
 * Save data to cache with expiry
 */
export const cacheData = async (key, data, durationMs = DEFAULT_CACHE_DURATION) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
    const expiryTime = Date.now() + durationMs;
    
    await AsyncStorage.multiSet([
      [cacheKey, JSON.stringify(data)],
      [expiryKey, expiryTime.toString()]
    ]);
    
    return true;
  } catch (error) {
    console.error('Cache save error:', error);
    return false;
  }
};

/**
 * Get data from cache (returns null if expired or not found)
 */
export const getCachedData = async (key) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
    
    const [[, data], [, expiry]] = await AsyncStorage.multiGet([cacheKey, expiryKey]);
    
    if (!data) return null;
    
    // Check if expired
    if (expiry && Date.now() > parseInt(expiry)) {
      // Remove expired data
      await AsyncStorage.multiRemove([cacheKey, expiryKey]);
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Check if we have valid cached data
 */
export const hasCachedData = async (key) => {
  const data = await getCachedData(key);
  return data !== null;
};

/**
 * Clear specific cache
 */
export const clearCache = async (key) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
    await AsyncStorage.multiRemove([cacheKey, expiryKey]);
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Clear all app cache
 */
export const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => 
      k.startsWith(CACHE_PREFIX) || k.startsWith(CACHE_EXPIRY_PREFIX)
    );
    await AsyncStorage.multiRemove(cacheKeys);
    return true;
  } catch (error) {
    console.error('Clear all cache error:', error);
    return false;
  }
};

/**
 * Add action to offline queue (to sync when back online)
 */
export const addToOfflineQueue = async (action) => {
  try {
    const queue = await getCachedData(CACHE_KEYS.OFFLINE_QUEUE) || [];
    queue.push({
      ...action,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    await cacheData(CACHE_KEYS.OFFLINE_QUEUE, queue, 7 * 24 * 60 * 60 * 1000); // Keep for 7 days
    return true;
  } catch (error) {
    console.error('Add to offline queue error:', error);
    return false;
  }
};

/**
 * Get offline queue
 */
export const getOfflineQueue = async () => {
  return await getCachedData(CACHE_KEYS.OFFLINE_QUEUE) || [];
};

/**
 * Remove item from offline queue
 */
export const removeFromOfflineQueue = async (actionId) => {
  try {
    const queue = await getOfflineQueue();
    const newQueue = queue.filter(item => item.id !== actionId);
    await cacheData(CACHE_KEYS.OFFLINE_QUEUE, newQueue, 7 * 24 * 60 * 60 * 1000);
    return true;
  } catch (error) {
    console.error('Remove from offline queue error:', error);
    return false;
  }
};

/**
 * Get cache stats
 */
export const getCacheStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) totalSize += value.length;
    }
    
    return {
      itemCount: cacheKeys.length,
      estimatedSizeKB: Math.round(totalSize / 1024),
      keys: cacheKeys.map(k => k.replace(CACHE_PREFIX, ''))
    };
  } catch (error) {
    console.error('Get cache stats error:', error);
    return { itemCount: 0, estimatedSizeKB: 0, keys: [] };
  }
};

export default {
  cacheData,
  getCachedData,
  hasCachedData,
  clearCache,
  clearAllCache,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  getCacheStats,
  CACHE_KEYS
};
