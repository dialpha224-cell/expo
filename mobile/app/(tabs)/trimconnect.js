import { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Logo couronne AfroCrown
const CROWN_LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/9b808fc4e303c6a3046e6ff14107d11a2bf66d1418b5dedcfc4504becd301851.png";

export default function TrimConnectScreen() {
  const { user, API_URL } = useAuth();
  const insets = useSafeAreaInsets();
  const [contestants, setContestants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    try {
      const response = await axios.get(`${API_URL}/trimconnect/contestants`);
      setContestants(response.data);
    } catch (error) {
      // Mock data
      setContestants([
        { id: 1, name: 'Marcus Johnson', salon: 'Salon Elite', votes: 1250, rank: 1, image: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/5a74bd03d51115436d28479c2be767eaf3a6ecf2eebdc673c11baea9501e31f9.png' },
        { id: 2, name: 'Jérôme Diallo', salon: 'Afro Style', votes: 1180, rank: 2, image: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/43162635dc0d00a032ccda23f09c1c00a668c10147ce7e6c81257d9eec8794f2.png' },
        { id: 3, name: 'Kevin Williams', salon: 'Crown Cuts', votes: 980, rank: 3, image: 'https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/40b52420728e44958ec43d1b43c6ebf627fc4f62d851326ce2ea13f5cfa65142.png' },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContestants();
    setRefreshing(false);
  };

  const handleVote = (contestantId) => {
    if (!user) {
      alert('Connectez-vous pour voter');
      return;
    }
    alert('Vote enregistré !');
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#64748b';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) + 80 : 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={{ uri: CROWN_LOGO_URL }} style={styles.crownLogo} />
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleGold}>Trim</Text>
            <Text style={styles.titleWhite}>Connect</Text>
          </Text>
          <Text style={styles.subtitle}>Le concours des meilleurs coiffeurs</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2.4K</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15.8K</Text>
            <Text style={styles.statLabel}>Votes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>5000€</Text>
            <Text style={styles.statLabel}>Prix</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Ionicons 
              name="trophy-outline" 
              size={18} 
              color={activeTab === 'leaderboard' ? '#0f172a' : '#94a3b8'} 
            />
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
              Classement
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'participate' && styles.tabActive]}
            onPress={() => setActiveTab('participate')}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={18} 
              color={activeTab === 'participate' ? '#0f172a' : '#94a3b8'} 
            />
            <Text style={[styles.tabText, activeTab === 'participate' && styles.tabTextActive]}>
              Participer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'leaderboard' ? (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Top Coiffeurs</Text>
            
            {contestants.map((contestant, index) => (
              <View key={contestant.id} style={styles.contestantCard}>
                {/* Rank Badge avec couronne pour le #1 */}
                {contestant.rank === 1 ? (
                  <View style={styles.winnerBadge}>
                    <Image source={{ uri: CROWN_LOGO_URL }} style={styles.winnerCrown} />
                  </View>
                ) : (
                  <View style={[styles.rankBadge, { backgroundColor: getRankColor(contestant.rank) }]}>
                    <Text style={styles.rankText}>#{contestant.rank}</Text>
                  </View>
                )}
                
                {/* Photo */}
                <Image source={{ uri: contestant.image }} style={styles.contestantImage} />
                
                {/* Info */}
                <View style={styles.contestantInfo}>
                  <Text style={styles.contestantName} numberOfLines={1}>{contestant.name}</Text>
                  <Text style={styles.contestantSalon} numberOfLines={1}>{contestant.salon}</Text>
                  <View style={styles.voteRow}>
                    <Ionicons name="heart" size={14} color="#FFD700" />
                    <Text style={styles.voteCount}>{contestant.votes}</Text>
                  </View>
                </View>
                
                {/* Vote Button */}
                <TouchableOpacity 
                  style={styles.voteBtn}
                  onPress={() => handleVote(contestant.id)}
                >
                  <Ionicons name="heart-outline" size={22} color="#FFD700" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.content}>
            {/* Participate Card */}
            <View style={styles.participateCard}>
              <Ionicons name="cut" size={40} color="#FFD700" />
              <Text style={styles.participateTitle}>Rejoignez le concours</Text>
              <Text style={styles.participateDesc}>
                Montrez votre talent et gagnez jusqu'à 5,000€
              </Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Frais d'inscription</Text>
                <Text style={styles.priceValue}>29,99€</Text>
              </View>
              
              <TouchableOpacity style={styles.participateBtn}>
                <Text style={styles.participateBtnText}>S'inscrire maintenant</Text>
              </TouchableOpacity>
            </View>
            
            {/* Rules */}
            <View style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>Règles du concours</Text>
              
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.ruleText}>Être coiffeur professionnel</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.ruleText}>Soumettre 3 photos</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.ruleText}>Obtenir des votes du public</Text>
              </View>
            </View>
          </View>
        )}

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
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoCircle: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  crownLogo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  titleGold: {
    color: '#FFD700',
  },
  titleWhite: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  
  // Contestant Card
  contestantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  winnerBadge: {
    position: 'absolute',
    top: -14,
    left: 6,
    width: 32,
    height: 32,
  },
  winnerCrown: {
    width: 32,
    height: 32,
  },
  rankText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  contestantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#334155',
  },
  contestantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contestantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  contestantSalon: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  voteBtn: {
    padding: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  
  // Participate Card
  participateCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  participateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  participateDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  priceLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  participateBtn: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 14,
  },
  participateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  
  // Rules Card
  rulesCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  rulesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
