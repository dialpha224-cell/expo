import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

export default function TrimConnectScreen() {
  const router = useRouter();
  const { user, token, login } = useAuth();
  const [entries, setEntries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('entries');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, leaderboardRes] = await Promise.all([
        axios.get(`${API_URL}/trimconnect/entries?status=approved`),
        axios.get(`${API_URL}/trimconnect/leaderboard`)
      ]);
      setEntries(entriesRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (entryId) => {
    if (!user) {
      login();
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_URL}/trimconnect/vote`, { entry_id: entryId }, { headers });
      alert('Vote enregistre !');
      fetchData();
    } catch (error) {
      if (error.response?.data?.detail === 'Already voted for this entry') {
        alert('Vous avez deja vote pour cette participation');
      } else {
        alert('Erreur lors du vote');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="trophy" size={20} color="#F59E0B" />
          <Text style={styles.headerTitle}>TrimConnect</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Barber Battle</Text>
        <Text style={styles.heroSubtitle}>Votez pour vos styles preferes</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
          onPress={() => setActiveTab('entries')}
        >
          <Text style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}>
            Participations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Classement
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <View style={styles.entriesGrid}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#64748B" />
                <Text style={styles.emptyText}>Aucune participation</Text>
              </View>
            ) : (
              entries.map((entry) => (
                <View key={entry.entry_id} style={styles.entryCard}>
                  <View style={styles.entryImage}>
                    {entry.image_url ? (
                      <Image source={{ uri: entry.image_url }} style={styles.entryImageContent} />
                    ) : (
                      <Ionicons name="image" size={40} color="#64748B" />
                    )}
                    {entry.status === 'finalist' && (
                      <View style={styles.finalistBadge}>
                        <Ionicons name="medal" size={12} color="#0F172A" />
                        <Text style={styles.finalistText}>Finaliste</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryBarber}>par {entry.barber_name}</Text>
                    <View style={styles.entryFooter}>
                      <View style={styles.voteCount}>
                        <Ionicons name="heart" size={16} color="#F59E0B" />
                        <Text style={styles.voteCountText}>{entry.votes}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.voteButton}
                        onPress={() => vote(entry.entry_id)}
                      >
                        <Ionicons name="heart-outline" size={16} color="#F59E0B" />
                        <Text style={styles.voteButtonText}>Voter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardList}>
            {leaderboard.slice(0, 10).map((entry, index) => (
              <View key={entry.entry_id} style={styles.leaderboardItem}>
                <View style={[
                  styles.rankBadge,
                  index === 0 && styles.rankGold,
                  index === 1 && styles.rankSilver,
                  index === 2 && styles.rankBronze
                ]}>
                  {index === 0 ? (
                    <Ionicons name="trophy" size={16} color="#0F172A" />
                  ) : (
                    <Text style={styles.rankText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.leaderboardImage}>
                  {entry.image_url ? (
                    <Image source={{ uri: entry.image_url }} style={styles.leaderboardImageContent} />
                  ) : (
                    <Ionicons name="image" size={20} color="#64748B" />
                  )}
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardTitle}>{entry.title}</Text>
                  <Text style={styles.leaderboardBarber}>{entry.barber_name}</Text>
                </View>
                <View style={styles.leaderboardVotes}>
                  <Text style={styles.leaderboardVotesCount}>{entry.votes}</Text>
                  <Text style={styles.leaderboardVotesLabel}>votes</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  entriesGrid: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    marginTop: 16,
  },
  entryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  entryImage: {
    height: 200,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryImageContent: {
    width: '100%',
    height: '100%',
  },
  finalistBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  finalistText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entryInfo: {
    padding: 16,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  entryBarber: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteCountText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  voteButtonText: {
    color: '#F59E0B',
    fontWeight: '500',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankGold: {
    backgroundColor: '#F59E0B',
  },
  rankSilver: {
    backgroundColor: '#94A3B8',
  },
  rankBronze: {
    backgroundColor: '#B45309',
  },
  rankText: {
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  leaderboardImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  leaderboardImageContent: {
    width: '100%',
    height: '100%',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardBarber: {
    fontSize: 12,
    color: '#94A3B8',
  },
  leaderboardVotes: {
    alignItems: 'flex-end',
  },
  leaderboardVotesCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  leaderboardVotesLabel: {
    fontSize: 11,
    color: '#64748B',
  },
});
