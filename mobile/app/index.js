import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { user, login } = useAuth();

  const features = [
    { icon: 'calendar', title: 'Reserver', desc: 'Prenez rendez-vous', route: '/booking' },
    { icon: 'sparkles', title: 'Simulation IA', desc: 'Testez votre coupe', route: '/ai-simulation' },
    { icon: 'cart', title: 'Marketplace', desc: 'Produits capillaires', route: '/marketplace' },
    { icon: 'trophy', title: 'TrimConnect', desc: 'Concours coiffure', route: '/trimconnect' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="cut" size={28} color="#6366f1" />
          <Text style={styles.logoText}>AfroCrown</Text>
        </View>
        {user ? (
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image 
              source={{ uri: user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff` }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={login}>
            <Text style={styles.loginBtnText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>La Reference de la{'\n'}
          <Text style={styles.heroTitleGradient}>Coiffure Afro</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Reservez, simulez votre coupe avec l'IA et decouvrez les meilleurs produits.
        </Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/booking')}
        >
          <Text style={styles.ctaButtonText}>Reserver maintenant</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.featureCard}
            onPress={() => router.push(feature.route)}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon} size={24} color="#818cf8" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TrimConnect Banner */}
      <TouchableOpacity 
        style={styles.trimconnectBanner}
        onPress={() => router.push('/trimconnect')}
      >
        <View style={styles.trimconnectContent}>
          <View style={styles.trimconnectHeader}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.trimconnectTitle}>TrimConnect Battle</Text>
          </View>
          <Text style={styles.trimconnectDesc}>
            Participez au plus grand concours de coiffure afro
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#F59E0B" />
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>500+</Text>
          <Text style={styles.statLabel}>Salons</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10K+</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Note</Text>
        </View>
      </View>
    </ScrollView>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loginBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  heroTitleGradient: {
    color: '#818cf8',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#94A3B8',
  },
  trimconnectBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trimconnectContent: {
    flex: 1,
  },
  trimconnectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  trimconnectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  trimconnectDesc: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 32,
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
});
