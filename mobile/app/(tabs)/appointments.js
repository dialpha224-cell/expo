import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user, API_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments/my`, {
        withCredentials: true
      });
      setAppointments(response.data);
    } catch (error) {
      console.log('Error fetching appointments:', error);
      // Mock data for demo
      setAppointments([
        {
          id: 1,
          salon_name: 'Salon TEST',
          barber_name: 'Marcus',
          service: 'Taper Fade',
          date: '2025-01-15',
          time: '14:00',
          status: 'confirmed',
          price: 25
        },
        {
          id: 2,
          salon_name: 'Afro Style Brussels',
          barber_name: 'Jérôme',
          service: '360 Waves',
          date: '2025-01-20',
          time: '10:30',
          status: 'pending',
          price: 30
        },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const cancelAppointment = (appointmentId) => {
    Alert.alert(
      'Annuler le rendez-vous',
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
                withCredentials: true
              });
              fetchAppointments();
              Alert.alert('Succès', 'Rendez-vous annulé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler le rendez-vous');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const upcomingAppointments = appointments.filter(a => 
    a.status === 'confirmed' || a.status === 'pending'
  );
  const pastAppointments = appointments.filter(a => 
    a.status === 'completed' || a.status === 'cancelled'
  );

  const renderAppointment = (appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {getStatusLabel(appointment.status)}
          </Text>
        </View>
        <Text style={styles.price}>{appointment.price}€</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.iconContainer}>
          <Ionicons name="cut" size={28} color="#FFD700" />
        </View>
        
        <View style={styles.appointmentDetails}>
          <Text style={styles.serviceName}>{appointment.service}</Text>
          <Text style={styles.salonName}>{appointment.salon_name}</Text>
          <Text style={styles.barberName}>avec {appointment.barber_name}</Text>
        </View>
      </View>
      
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
          <Text style={styles.dateTimeText}>{formatDate(appointment.date)}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={18} color="#94a3b8" />
          <Text style={styles.dateTimeText}>{appointment.time}</Text>
        </View>
      </View>
      
      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Itinéraire</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => cancelAppointment(appointment.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
            <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#64748b" />
          <Text style={styles.emptyTitle}>Connectez-vous</Text>
          <Text style={styles.emptyText}>
            Connectez-vous pour voir vos rendez-vous
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Rendez-vous</Text>
        <Text style={styles.subtitle}>
          {upcomingAppointments.length} rendez-vous à venir
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            À venir ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Historique ({pastAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'upcoming' ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(renderAppointment)
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color="#64748b" />
              <Text style={styles.emptyText}>Aucun rendez-vous à venir</Text>
              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => router.push('/(tabs)/booking')}
              >
                <Text style={styles.bookBtnText}>Réserver maintenant</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          pastAppointments.length > 0 ? (
            pastAppointments.map(renderAppointment)
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="time-outline" size={48} color="#64748b" />
              <Text style={styles.emptyText}>Aucun historique</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  appointmentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDetails: {
    marginLeft: 16,
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  salonName: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  barberName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelBtnText: {
    color: '#ef4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySection: {
    alignItems: 'center',
    padding: 40,
  },
  loginBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  loginBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  bookBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
});
