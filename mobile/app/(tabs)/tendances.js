import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Platform,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

export default function TendancesScreen() {
  const router = useRouter();
  const { user, API_URL } = useAuth();
  const insets = useSafeAreaInsets();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedTrends, setLikedTrends] = useState([]);
  const [activeFilter, setActiveFilter] = useState('popular');

  const fetchTrends = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/trends`);
      setTrends(response.data);
    } catch (error) {
      console.log('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrends();
    setRefreshing(false);
  };

  const handleLike = async (trendId) => {
    if (likedTrends.includes(trendId)) return;
    
    try {
      await axios.post(`${API_URL}/trends/${trendId}/like`);
      setLikedTrends([...likedTrends, trendId]);
      setTrends(prev => prev.map(t => 
        t.trend_id === trendId ? { ...t, likes: t.likes + 1 } : t
      ));
    } catch (error) {
      console.log('Error liking trend:', error);
    }
  };

  const handleShare = async (trend) => {
    try {
      await Share.share({
        message: `Découvrez cette coupe tendance sur AfroCrown: ${trend.caption}`,
        url: trend.image_url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const sortedTrends = [...trends].sort((a, b) => {
    if (activeFilter === 'popular') return b.likes - a.likes;
    if (activeFilter === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const filters = [
    { key: 'popular', label: 'Populaires', icon: 'flame' },
    { key: 'recent', label: 'Récentes', icon: 'time' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tendances</Text>
          <Text style={styles.headerSubtitle}>du moment</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterBtn, activeFilter === filter.key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Ionicons 
              name={filter.icon} 
              size={16} 
              color={activeFilter === filter.key ? '#0f172a' : '#94a3b8'} 
            />
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) + 80 : 100 }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="sparkles" size={40} color="#FFD700" />
            <Text style={styles.loadingText}>Chargement des tendances...</Text>
          </View>
        ) : sortedTrends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={60} color="#64748b" />
            <Text style={styles.emptyTitle}>Aucune tendance</Text>
            <Text style={styles.emptyText}>Revenez bientôt pour découvrir les dernières créations</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {sortedTrends.map((trend, index) => (
              <View key={trend.trend_id} style={styles.card}>
                <Image 
                  source={{ uri: trend.image_url }} 
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                
                {/* Featured Badge */}
                {trend.is_featured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color="#0f172a" />
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}
                
                {/* Gradient Overlay */}
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardCaption} numberOfLines={2}>
                    {trend.caption}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.salonName} numberOfLines={1}>
                      {trend.salon_name || 'Salon'}
                    </Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleLike(trend.trend_id)}
                      >
                        <Ionicons 
                          name={likedTrends.includes(trend.trend_id) ? "heart" : "heart-outline"} 
                          size={18} 
                          color={likedTrends.includes(trend.trend_id) ? "#ef4444" : "#fff"} 
                        />
                        <Text style={styles.actionCount}>{trend.likes}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleShare(trend)}
                      >
                        <Ionicons name="share-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 14,
  },
  emptyContainer: {
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
    paddingHorizontal: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salonName: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});
