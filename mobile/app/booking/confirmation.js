import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments/${id}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>

        <Text style={styles.title}>Reservation Confirmee !</Text>
        <Text style={styles.subtitle}>
          Votre rendez-vous a ete enregistre avec succes
        </Text>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Votre QR Code</Text>
          <Text style={styles.qrSubtitle}>Presentez-le a votre arrivee au salon</Text>
          
          {appointment?.qr_code ? (
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: appointment.qr_code }}
                style={styles.qrImage}
              />
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color="#64748B" />
            </View>
          )}

          <Text style={styles.refText}>Ref: {id}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.infoText}>Presentez-vous 5 min avant l'heure</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.infoText}>Montrez votre QR code au coiffeur</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.infoText}>Paiement apres la prestation</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.homeButtonText}>Retour a l'accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  qrSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrPlaceholder: {
    backgroundColor: '#334155',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  refText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
