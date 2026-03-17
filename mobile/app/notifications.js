import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from './_layout';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, API_URL } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${API_URL}/notifications`, { 
        withCredentials: true,
        params: { limit: 50 }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications(prev => 
        prev.map(n => 
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        { withCredentials: true }
      );
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
    } catch (error) {
      console.log('Error deleting notification:', error);
    }
  };

  const confirmDelete = (notificationId) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteNotification(notificationId) },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_appointment':
        return { name: 'calendar', color: '#10b981' };
      case 'appointment_cancelled':
        return { name: 'close-circle', color: '#ef4444' };
      case 'appointment_confirmed':
        return { name: 'checkmark-circle', color: '#6366f1' };
      case 'reminder':
        return { name: 'alarm', color: '#f59e0b' };
      default:
        return { name: 'notifications', color: '#FFD700' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="log-in-outline" size={60} color="#64748b" />
          <Text style={styles.emptyTitle}>Non connecté</Text>
          <Text style={styles.emptyText}>Connectez-vous pour voir vos notifications</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color="#64748b" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>Vous n'avez pas encore de notifications</Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const icon = getNotificationIcon(notification.type);
            return (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadCard
                ]}
                onPress={() => markAsRead(notification.notification_id)}
                onLongPress={() => confirmDelete(notification.notification_id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                  <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, !notification.is_read && styles.unreadTitle]}>
                      {notification.title}
                    </Text>
                    {!notification.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTime(notification.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unreadText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  loginBtnText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e2e8f0',
    flex: 1,
  },
  unreadTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
});
