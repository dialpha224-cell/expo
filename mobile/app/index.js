import { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './_layout';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.loadingLogo}>
            <Ionicons name="cut" size={50} color="#FFD700" />
          </View>
        </Animated.View>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const features = [
    { 
      icon: 'calendar', 
      title: 'Réservation', 
      color: '#FFD700',
      gradient: ['#FFD700', '#F59E0B']
    },
    { 
      icon: 'sparkles', 
      title: 'Simulation IA', 
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#6366F1']
    },
    { 
      icon: 'trophy', 
      title: 'Concours', 
      color: '#F59E0B',
      gradient: ['#F59E0B', '#EF4444']
    },
    { 
      icon: 'cart', 
      title: 'Marketplace', 
      color: '#10B981',
      gradient: ['#10B981', '#059669']
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#0f172a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Decorations */}
        <View style={styles.decorations}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Logo & Title */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo with glow effect */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#FFD700', '#F59E0B']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cut" size={50} color="#0f172a" />
            </LinearGradient>
            <View style={styles.logoGlow} />
          </Animated.View>
          
          <Text style={styles.title}>AfroCrown</Text>
          <Text style={styles.subtitle}>La Référence de la Coiffure Afro</Text>
          
          {/* Tagline badge */}
          <View style={styles.taglineBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.taglineText}>N°1 en France</Text>
            <Ionicons name="star" size={12} color="#FFD700" />
          </View>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.2))
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={feature.icon} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.featureText}>{feature.title}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom Section with Buttons */}
        <Animated.View 
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>30+</Text>
              <Text style={styles.statLabel}>Styles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>IA</Text>
              <Text style={styles.statLabel}>Simulation</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Réservation</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#F59E0B']}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-in-outline" size={20} color="#0f172a" />
                <Text style={styles.primaryButtonText}>Connexion</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Ionicons name="compass-outline" size={20} color="#FFD700" />
              <Text style={styles.secondaryButtonText}>Explorer sans compte</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            En continuant, vous acceptez nos conditions d'utilisation
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    bottom: 200,
    left: -80,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    bottom: -50,
    right: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  taglineText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  featureCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttons: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11,
    marginTop: 8,
  },
});
