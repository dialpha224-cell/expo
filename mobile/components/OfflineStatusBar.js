import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OfflineStatusBar = ({ isOnline, pendingActions, isSyncing, onSync }) => {
  if (isOnline && pendingActions === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isOnline ? styles.syncing : styles.offline
    ]}>
      <View style={styles.content}>
        <Ionicons 
          name={isOnline ? "cloud-upload-outline" : "cloud-offline-outline"} 
          size={18} 
          color="#FFF" 
        />
        <Text style={styles.text}>
          {!isOnline 
            ? "Mode hors-ligne" 
            : isSyncing 
              ? "Synchronisation..."
              : `${pendingActions} action(s) en attente`
          }
        </Text>
      </View>
      
      {isOnline && pendingActions > 0 && !isSyncing && (
        <TouchableOpacity onPress={onSync} style={styles.syncButton}>
          <Ionicons name="sync" size={16} color="#FFF" />
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
      
      {isSyncing && (
        <Animated.View style={styles.spinner}>
          <Ionicons name="sync" size={16} color="#FFF" />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offline: {
    backgroundColor: '#EF4444',
  },
  syncing: {
    backgroundColor: '#F59E0B',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  syncText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  spinner: {
    // Animation handled by parent
  }
});

export default OfflineStatusBar;
