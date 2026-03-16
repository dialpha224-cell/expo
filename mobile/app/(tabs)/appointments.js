import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView
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
      // Mock data
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
      'Annuler le RDV',
      'Voulez-vous annuler ce rendez-vous ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/appointments/${appointmentId}`);
              fetchAppointments();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler');
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return { bg: '#10b98120', color: '#10b981', label: 'Confirmé' };
      case 'pending': return { bg: '#f59e0b20', color: '#f59e0b', label: 'En attente' };
      case 'completed': return { bg: '#6366f120', color: '#6366f1', label: 'Terminé' };
      case 'cancelled': return { bg: '#ef444420', color: '#ef4444', label: 'Annulé' };
      default: return { bg: '#64748b20', color: '#64748b', label: status };
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <View style={styles.loginIcon}>
            <Ionicons name="calendar-outline" size={48} color="#64748b" />
          </View>
          <Text style={styles.loginTitle}>Connectez-vous</Text>
          <Text style={styles.loginText}>Pour voir vos rendez-vous</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mes RDV</Text>
          <Text style={styles.subtitle}>{upcomingAppointments.length} rendez-vous à venir</Text>
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
              upcomingAppointments.map((apt) => {
                const statusStyle = getStatusStyle(apt.status);
                return (
                  <View key={apt.id} style={styles.appointmentCard}>
                    {/* Status & Price */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      <Text style={styles.price}>{apt.price}€</Text>
                    </View>
                    
                    {/* Info */}
                    <View style={styles.cardBody}>
                      <View style={styles.iconBox}>
                        <Ionicons name="cut" size={24} color="#FFD700" />
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.serviceName}>{apt.service}</Text>
                        <Text style={styles.salonName}>{apt.salon_name}</Text>
                        <Text style={styles.barberName}>avec {apt.barber_name}</Text>
                      </View>
                    </View>
                    
                    {/* Date/Time */}
                    <View style={styles.dateRow}>
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                        <Text style={styles.dateText}>{formatDate(apt.date)}</Text>
                      </View>
                      <View style={styles.dateItem}>
                        <Ionicons name="time-outline" size={16} color="#94a3b8" />
                        <Text style={styles.dateText}>{apt.time}</Text>
                      </View>
                    </View>
                    
                    {/* Actions */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="navigate-outline" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Itinéraire</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={() => cancelAppointment(apt.id)}
                      >
                        <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                        <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#64748b" />
                <Text style={styles.emptyText}>Aucun RDV à venir</Text>
                <TouchableOpacity style={styles.bookBtn} onPress={() => router.push('/(tabs)/booking')}>
                  <Text style={styles.bookBtnText}>Réserver</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            pastAppointments.length > 0 ? (
              pastAppointments.map((apt) => {
                const statusStyle = getStatusStyle(apt.status);
                return (
                  <View key={apt.id} style={[styles.appointmentCard, styles.pastCard]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      <Text style={styles.price}>{apt.price}€</Text>
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.iconBox}>
                        <Ionicons name="cut" size={24} color="#64748b" />
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.serviceName}>{apt.service}</Text>
                        <Text style={styles.salonName}>{apt.salon_name}</Text>
                        <Text style={styles.dateText}>{formatDate(apt.date)} à {apt.time}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={40} color="#64748b" />
                <Text style={styles.emptyText}>Aucun historique</Text>
              </View>
            )
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#FFD700',
    marginTop: 2,
  },
  
  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  
  // Content
  content: {
    paddingHorizontal: 16,
  },
  
  // Appointment Card
  appointmentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  pastCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  salonName: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 1,
  },
  barberName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  cancelBtnText: {
    color: '#ef4444',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 10,
  },
  bookBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  
  // Login Prompt
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#1e293b',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
});
