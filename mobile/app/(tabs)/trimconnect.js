import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function TrimConnectScreen() {
  const { user, API_URL } = useAuth();
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
      console.log('Error fetching contestants:', error);
      // Mock data for demo
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

  const renderContestant = (contestant, index) => (
    <View key={contestant.id} style={styles.contestantCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{contestant.rank}</Text>
      </View>
      
      <Image source={{ uri: contestant.image }} style={styles.contestantImage} />
      
      <View style={styles.contestantInfo}>
        <Text style={styles.contestantName}>{contestant.name}</Text>
        <Text style={styles.contestantSalon}>{contestant.salon}</Text>
        <View style={styles.voteInfo}>
          <Ionicons name="heart" size={16} color="#FFD700" />
          <Text style={styles.voteCount}>{contestant.votes} votes</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.voteBtn}
        onPress={() => handleVote(contestant.id)}
      >
        <Ionicons name="heart-outline" size={24} color="#FFD700" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
        </View>
        <Text style={styles.title}>TrimConnect</Text>
        <Text style={styles.subtitle}>Le concours des meilleurs coiffeurs</Text>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>2,450</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>15,800</Text>
          <Text style={styles.statLabel}>Votes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5,000€</Text>
          <Text style={styles.statLabel}>Prix</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Ionicons name="trophy-outline" size={20} color={activeTab === 'leaderboard' ? '#FFD700' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>Classement</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'participate' && styles.tabActive]}
          onPress={() => setActiveTab('participate')}
        >
          <Ionicons name="add-circle-outline" size={20} color={activeTab === 'participate' ? '#FFD700' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'participate' && styles.tabTextActive]}>Participer</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Top Coiffeurs</Text>
          {contestants.map(renderContestant)}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.participateCard}>
            <Ionicons name="cut" size={48} color="#FFD700" />
            <Text style={styles.participateTitle}>Rejoignez le concours</Text>
            <Text style={styles.participateText}>
              Montrez votre talent et gagnez jusqu'à 5,000€ en participant au concours TrimConnect.
            </Text>
            <View style={styles.participateFee}>
              <Text style={styles.feeLabel}>Frais d'inscription</Text>
              <Text style={styles.feeAmount}>29,99€</Text>
            </View>
            <TouchableOpacity style={styles.participateBtn}>
              <Text style={styles.participateBtnText}>S'inscrire maintenant</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Règles du concours</Text>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.ruleText}>Être coiffeur professionnel</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.ruleText}>Soumettre 3 photos de réalisations</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.ruleText}>Obtenir des votes du public</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#1e293b',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#334155',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFD700',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  contestantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contestantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#334155',
  },
  contestantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contestantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contestantSalon: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  voteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  voteCount: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  voteBtn: {
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  participateCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  participateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  participateText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  participateFee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  feeLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  feeAmount: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  participateBtn: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  participateBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  rulesCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  rulesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ruleText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
