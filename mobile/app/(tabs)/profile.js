import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, API_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/my-appointments`, { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.log('Error fetching appointments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Etes-vous sur de vouloir vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Deconnexion', onPress: () => {
          logout();
          router.replace('/');
        }},
      ]
    );
  };

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#d97706' },
    confirmed: { bg: '#dbeafe', text: '#2563eb' },
    completed: { bg: '#dcfce7', text: '#16a34a' },
    cancelled: { bg: '#fee2e2', text: '#dc2626' },
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmee',
    completed: 'Terminee',
    cancelled: 'Annulee',
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-outline" size={80} color="#64748b" />
          <Text style={styles.notLoggedInTitle}>Non connecte</Text>
          <Text style={styles.notLoggedInText}>
            Connectez-vous pour acceder a votre profil et vos reservations
          </Text>
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff` }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>RDV</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Avis</Text>
        </View>
      </View>

      {/* Appointments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Reservations</Text>
        
        {appointments.length === 0 ? (
          <View style={styles.emptyAppointments}>
            <Ionicons name="calendar-outline" size={40} color="#64748b" />
            <Text style={styles.emptyText}>Aucune reservation</Text>
            <TouchableOpacity 
              style={styles.bookNowBtn}
              onPress={() => router.push('/(tabs)/booking')}
            >
              <Text style={styles.bookNowBtnText}>Reserver maintenant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.slice(0, 5).map((apt) => (
            <View key={apt.appointment_id} style={styles.appointmentCard}>
              <View style={styles.appointmentIcon}>
                <Ionicons name="cut" size={24} color="#818cf8" />
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentSalon}>{apt.salon_name || 'Salon'}</Text>
                <Text style={styles.appointmentDate}>
                  {apt.date} a {apt.time_slot}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: statusColors[apt.status]?.bg || '#f1f5f9' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: statusColors[apt.status]?.text || '#64748b' }
                ]}>
                  {statusLabels[apt.status] || apt.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#94a3b8" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#94a3b8" />
          <Text style={styles.menuText}>Paiements</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#94a3b8" />
          <Text style={styles.menuText}>Parametres</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#94a3b8" />
          <Text style={styles.menuText}>Aide</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Deconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AfroCrown v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  notLoggedInText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  emptyAppointments: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 30,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 12,
    marginBottom: 16,
  },
  bookNowBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookNowBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  appointmentSalon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  appointmentDate: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  menuText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
});
