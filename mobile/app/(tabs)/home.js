import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, API_URL } = useAuth();
  const [salons, setSalons] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await axios.get(`${API_URL}/salons`);
      setSalons(response.data.slice(0, 5)); // Limite à 5 salons
    } catch (error) {
      console.log('Error fetching salons:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons();
    setRefreshing(false);
  };

  const quickActions = [
    { id: 'booking', title: 'Réserver', icon: 'calendar', color: '#FFD700', route: '/(tabs)/booking' },
    { id: 'simulation', title: 'Simulation', icon: 'sparkles', color: '#6366f1', route: '/(tabs)/simulation' },
    { id: 'trimconnect', title: 'Concours', icon: 'trophy', color: '#f59e0b', route: '/(tabs)/trimconnect' },
    { id: 'marketplace', title: 'Shop', icon: 'cart', color: '#10b981', route: '/(tabs)/marketplace' },
  ];

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
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Bonjour{user ? `, ${user.name?.split(' ')[0] || ''}` : ''} !
            </Text>
            <Text style={styles.subtitle}>Trouvez votre prochain style</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="cut" size={24} color="#FFD700" />
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>AfroCrown</Text>
            <Text style={styles.heroSubtitle}>La plateforme N°1 pour la coiffure afro</Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/booking')}
            >
              <Text style={styles.heroButtonText}>Réserver maintenant</Text>
              <Ionicons name="arrow-forward" size={16} color="#0f172a" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroDecoration}>
            <Ionicons name="cut" size={80} color="rgba(255,215,0,0.2)" />
          </View>
        </View>

        {/* Quick Actions - Grid 2x2 */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredCard}>
            <View style={styles.featuredIcon}>
              <Ionicons name="sparkles" size={28} color="#FFD700" />
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Simulation IA</Text>
              <Text style={styles.featuredSubtitle}>Essayez 30+ coiffures sans connexion</Text>
            </View>
            <TouchableOpacity 
              style={styles.featuredButton}
              onPress={() => router.push('/(tabs)/simulation')}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Salons Section */}
        <View style={styles.salonsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Salons populaires</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/booking')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {salons.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={40} color="#64748b" />
              <Text style={styles.emptyText}>Aucun salon disponible</Text>
            </View>
          ) : (
            salons.map((salon) => (
              <TouchableOpacity 
                key={salon.salon_id}
                style={styles.salonCard}
                onPress={() => router.push('/(tabs)/booking')}
                activeOpacity={0.7}
              >
                <View style={styles.salonIcon}>
                  <Ionicons name="cut" size={28} color="#FFD700" />
                </View>
                <View style={styles.salonInfo}>
                  <Text style={styles.salonName} numberOfLines={1}>{salon.name}</Text>
                  <Text style={styles.salonAddress} numberOfLines={1}>{salon.address}</Text>
                  <View style={styles.salonMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.ratingText}>{salon.rating || 4.8}</Text>
                    </View>
                    <Text style={styles.reviewCount}>({salon.total_reviews || 0} avis)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Bottom spacer */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  logoContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#1e293b',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  
  // Hero Banner
  heroBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  heroDecoration: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.5,
  },
  
  // Actions
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Featured
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  featuredIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    flex: 1,
    marginLeft: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  featuredSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  featuredButton: {
    padding: 8,
  },
  
  // Salons
  salonsSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '500',
  },
  salonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  salonIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  salonAddress: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  reviewCount: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 6,
  },
  
  // Empty
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
});
