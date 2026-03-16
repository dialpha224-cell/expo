import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

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
      setSalons(response.data);
    } catch (error) {
      console.log('Error fetching salons:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons();
    setRefreshing(false);
  };

  const renderSalonCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.salonCard}
      onPress={() => router.push(`/salon/${item.salon_id}`)}
    >
      <View style={styles.salonImage}>
        <Ionicons name="cut" size={40} color="#818cf8" />
      </View>
      <View style={styles.salonInfo}>
        <Text style={styles.salonName}>{item.name}</Text>
        <Text style={styles.salonAddress} numberOfLines={1}>{item.address}</Text>
        <View style={styles.salonMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating || 4.8}</Text>
          </View>
          <Text style={styles.reviewCount}>({item.total_reviews || 0} avis)</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Bonjour{user ? `, ${user.name.split(' ')[0]}` : ''} !
        </Text>
        <Text style={styles.welcomeSubtext}>
          Trouvez votre prochain style
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/booking')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFD700' }]}>
            <Ionicons name="calendar" size={24} color="#0f172a" />
          </View>
          <Text style={styles.actionText}>Réserver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/simulation')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#6366f1' }]}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Simulation IA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/trimconnect')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
            <Ionicons name="trophy" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Concours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/marketplace')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
            <Ionicons name="cart" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Salons Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Salons a proximite</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {salons.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color="#64748b" />
            <Text style={styles.emptyText}>Aucun salon disponible</Text>
          </View>
        ) : (
          salons.map((salon) => (
            <View key={salon.salon_id}>
              {renderSalonCard({ item: salon })}
            </View>
          ))
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
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionCard: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    color: '#818cf8',
    fontSize: 14,
  },
  salonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  salonImage: {
    width: 70,
    height: 70,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonInfo: {
    flex: 1,
    marginLeft: 16,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  salonAddress: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
  },
});
