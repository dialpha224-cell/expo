import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://salon-dashboard-48.preview.emergentagent.com/api';

export default function BookingScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [salons, setSalons] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00'
  ];

  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    if (date.getDay() !== 0) {
      dates.push(date);
    }
  }

  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      fetchSalonData(selectedSalon.salon_id);
    }
  }, [selectedSalon]);

  const fetchSalons = async () => {
    try {
      const response = await axios.get(`${API_URL}/salons`);
      setSalons(response.data);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonData = async (salonId) => {
    try {
      const [barbersRes, haircutsRes] = await Promise.all([
        axios.get(`${API_URL}/salons/${salonId}/barbers`),
        axios.get(`${API_URL}/salons/${salonId}/haircuts`)
      ]);
      setBarbers(barbersRes.data);
      setHaircuts(haircutsRes.data);
    } catch (error) {
      console.error('Error fetching salon data:', error);
    }
  };

  const handleBooking = async () => {
    try {
      const bookingData = {
        salon_id: selectedSalon.salon_id,
        barber_id: selectedBarber.barber_id,
        haircut_id: selectedHaircut.haircut_id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        client_notes: '',
        client_photos: []
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${API_URL}/appointments`, bookingData, { headers });
      
      router.push(`/booking/confirmation?id=${response.data.appointment_id}`);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Erreur lors de la reservation');
    }
  };

  const formatDate = (date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedSalon !== null;
      case 2: return selectedHaircut !== null;
      case 3: return selectedBarber !== null;
      case 4: return selectedDate !== null && selectedTime !== null;
      default: return true;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
              {step > s ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={styles.progressDotText}>{s}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Step 1: Select Salon */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Choisissez votre salon</Text>
            {salons.map((salon) => (
              <TouchableOpacity
                key={salon.salon_id}
                style={[styles.card, selectedSalon?.salon_id === salon.salon_id && styles.cardSelected]}
                onPress={() => setSelectedSalon(salon)}
              >
                <Text style={styles.cardTitle}>{salon.name}</Text>
                <View style={styles.cardRow}>
                  <Ionicons name="location" size={16} color="#64748B" />
                  <Text style={styles.cardText}>{salon.address}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.cardText}>{salon.rating || 4.8}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Select Haircut */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Choisissez votre coupe</Text>
            {haircuts.map((haircut) => (
              <TouchableOpacity
                key={haircut.haircut_id}
                style={[styles.card, selectedHaircut?.haircut_id === haircut.haircut_id && styles.cardSelected]}
                onPress={() => setSelectedHaircut(haircut)}
              >
                <Text style={styles.cardTitle}>{haircut.name}</Text>
                <Text style={styles.cardDesc}>{haircut.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>{haircut.price} EUR</Text>
                  <Text style={styles.cardDuration}>{haircut.duration_minutes} min</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Select Barber */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Choisissez votre coiffeur</Text>
            {barbers.map((barber) => (
              <TouchableOpacity
                key={barber.barber_id}
                style={[styles.card, selectedBarber?.barber_id === barber.barber_id && styles.cardSelected]}
                onPress={() => setSelectedBarber(barber)}
              >
                <View style={styles.barberRow}>
                  <View style={styles.barberAvatar}>
                    <Ionicons name="person" size={24} color="#64748B" />
                  </View>
                  <View style={styles.barberInfo}>
                    <Text style={styles.cardTitle}>{barber.name}</Text>
                    <Text style={styles.cardText}>{barber.specialties?.join(', ')}</Text>
                    <View style={styles.cardRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.cardText}>{barber.rating || 4.8}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4: Select Date & Time */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateCard, selectedDate?.getTime() === date.getTime() && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dateText, selectedDate?.getTime() === date.getTime() && styles.dateTextSelected]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Heure</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeCard, selectedTime === time && styles.timeCardSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>Confirmation</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Salon</Text>
                <Text style={styles.summaryValue}>{selectedSalon?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coupe</Text>
                <Text style={styles.summaryValue}>{selectedHaircut?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coiffeur</Text>
                <Text style={styles.summaryValue}>{selectedBarber?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{selectedDate && formatDate(selectedDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Heure</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{selectedHaircut?.price} EUR</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={step === 5 ? handleBooking : nextStep}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === 5 ? 'Confirmer' : 'Continuer'}
          </Text>
          <Ionicons name={step === 5 ? 'checkmark' : 'arrow-forward'} size={20} color="#fff" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: '#4F46E5',
  },
  progressDotText: {
    color: '#64748B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  cardSelected: {
    borderColor: '#4F46E5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#818cf8',
  },
  cardDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  barberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberInfo: {
    flex: 1,
  },
  dateScroll: {
    marginBottom: 8,
  },
  dateCard: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#334155',
  },
  dateCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  dateText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  dateTextSelected: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  timeText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeTextSelected: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  summaryTotalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    color: '#818cf8',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
