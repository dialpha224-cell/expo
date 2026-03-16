import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function BookingScreen() {
  const router = useRouter();
  const { user, API_URL } = useAuth();
  const [step, setStep] = useState(1);
  const [salons, setSalons] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [haircuts, setHaircuts] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filtres pays/ville
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
      setSalons([]);
      setSelectedCity(null);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity) {
      fetchSalons();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedSalon) {
      fetchBarbers();
      fetchHaircuts();
    }
  }, [selectedSalon]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${API_URL}/salons/locations/countries`);
      setCountries(response.data);
    } catch (error) {
      console.log('Error fetching countries:', error);
      // Fallback data
      setCountries(['Belgique', 'France', 'Pays-Bas']);
    }
  };

  const fetchCities = async (country) => {
    try {
      const response = await axios.get(`${API_URL}/salons/locations/cities?country=${country}`);
      setCities(response.data);
    } catch (error) {
      console.log('Error fetching cities:', error);
      setCities(['Bruxelles', 'Anvers', 'Gand']);
    }
  };

  const fetchSalons = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await axios.get(`${API_URL}/salons?${params.toString()}`);
      setSalons(response.data);
    } catch (error) {
      console.log('Error fetching salons:', error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await axios.get(`${API_URL}/salons/${selectedSalon.salon_id}/barbers`);
      setBarbers(response.data);
    } catch (error) {
      console.log('Error fetching barbers:', error);
    }
  };

  const fetchHaircuts = async () => {
    try {
      const response = await axios.get(`${API_URL}/salons/${selectedSalon.salon_id}/haircuts`);
      setHaircuts(response.data);
    } catch (error) {
      console.log('Error fetching haircuts:', error);
    }
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      });
    }
    return dates;
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour reserver');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/appointments`, {
        salon_id: selectedSalon.salon_id,
        barber_id: selectedBarber.barber_id,
        haircut_id: selectedHaircut.haircut_id,
        date: selectedDate,
        time_slot: selectedTime,
      }, { withCredentials: true });

      Alert.alert('Reservation confirmee!', 'Vous recevrez une notification de rappel.');
      router.replace('/(tabs)/profile');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de creer la reservation');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez un salon</Text>
            
            {/* Country Selection */}
            <Text style={styles.filterLabel}>Pays</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[styles.filterChip, selectedCountry === country && styles.filterChipActive]}
                  onPress={() => setSelectedCountry(country)}
                >
                  <Text style={[styles.filterChipText, selectedCountry === country && styles.filterChipTextActive]}>
                    {country}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* City Selection */}
            {selectedCountry && (
              <>
                <Text style={styles.filterLabel}>Ville</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.filterChip, selectedCity === city && styles.filterChipActive]}
                      onPress={() => setSelectedCity(city)}
                    >
                      <Text style={[styles.filterChipText, selectedCity === city && styles.filterChipTextActive]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            
            {/* Salons List */}
            {selectedCity && salons.length > 0 && (
              <>
                <Text style={styles.filterLabel}>Salons disponibles</Text>
                {salons.map((salon) => (
                  <TouchableOpacity
                    key={salon.salon_id}
                    style={[
                      styles.optionCard,
                      selectedSalon?.salon_id === salon.salon_id && styles.optionCardSelected
                    ]}
                    onPress={() => setSelectedSalon(salon)}
                  >
                    <View style={styles.salonIcon}>
                      <Ionicons name="cut" size={30} color="#FFD700" />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>{salon.name}</Text>
                      <Text style={styles.optionSubtitle}>{salon.address}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text style={styles.ratingText}>{salon.rating || 4.8}</Text>
                      </View>
                    </View>
                    {selectedSalon?.salon_id === salon.salon_id && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
            
            {selectedCity && salons.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={48} color="#64748b" />
                <Text style={styles.emptyText}>Aucun salon trouvé dans cette ville</Text>
              </View>
            )}
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez une coupe</Text>
            <View style={styles.haircutsGrid}>
              {haircuts.map((haircut) => (
                <TouchableOpacity
                  key={haircut.haircut_id}
                  style={[
                    styles.haircutCard,
                    selectedHaircut?.haircut_id === haircut.haircut_id && styles.haircutCardSelected
                  ]}
                  onPress={() => setSelectedHaircut(haircut)}
                >
                  {haircut.image_url ? (
                    <Image source={{ uri: haircut.image_url }} style={styles.haircutImage} />
                  ) : (
                    <View style={styles.haircutImagePlaceholder}>
                      <Ionicons name="cut" size={32} color="#FFD700" />
                    </View>
                  )}
                  <View style={[styles.haircutInfo, selectedHaircut?.haircut_id === haircut.haircut_id && styles.haircutInfoSelected]}>
                    <Text style={[styles.haircutName, selectedHaircut?.haircut_id === haircut.haircut_id && styles.haircutNameSelected]} numberOfLines={1}>
                      {haircut.name}
                    </Text>
                    <View style={styles.haircutMeta}>
                      <Text style={[styles.haircutDuration, selectedHaircut?.haircut_id === haircut.haircut_id && styles.haircutDurationSelected]}>
                        {haircut.duration_minutes} min
                      </Text>
                      <Text style={[styles.haircutPrice, selectedHaircut?.haircut_id === haircut.haircut_id && styles.haircutPriceSelected]}>
                        {haircut.price}€
                      </Text>
                    </View>
                  </View>
                  {selectedHaircut?.haircut_id === haircut.haircut_id && (
                    <View style={styles.haircutCheckBadge}>
                      <Ionicons name="checkmark" size={14} color="#0f172a" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez un coiffeur</Text>
            {barbers.map((barber) => (
              <TouchableOpacity
                key={barber.barber_id}
                style={[
                  styles.optionCard,
                  selectedBarber?.barber_id === barber.barber_id && styles.optionCardSelected
                ]}
                onPress={() => setSelectedBarber(barber)}
              >
                <Image
                  source={{ uri: barber.photo_url || barber.image_url || `https://ui-avatars.com/api/?name=${barber.name}&background=FFD700&color=0f172a` }}
                  style={styles.barberPhoto}
                />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{barber.name}</Text>
                  <Text style={styles.optionSubtitle}>{barber.specialty || 'Coiffeur'}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.ratingText}>{barber.rating || 4.8}</Text>
                  </View>
                </View>
                {selectedBarber?.barber_id === barber.barber_id && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 4:
        const dates = generateDates();
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez date et heure</Text>
            
            <Text style={styles.label}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.date}
                  style={[
                    styles.dateCard,
                    selectedDate === d.date && styles.dateCardSelected
                  ]}
                  onPress={() => setSelectedDate(d.date)}
                >
                  <Text style={[styles.dateDay, selectedDate === d.date && styles.dateTextSelected]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dateNum, selectedDate === d.date && styles.dateTextSelected]}>
                    {d.dayNum}
                  </Text>
                  <Text style={[styles.dateMonth, selectedDate === d.date && styles.dateTextSelected]}>
                    {d.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Heure</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirmation</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name="storefront" size={20} color="#818cf8" />
                <Text style={styles.summaryLabel}>Salon</Text>
                <Text style={styles.summaryValue}>{selectedSalon?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cut" size={20} color="#818cf8" />
                <Text style={styles.summaryLabel}>Coupe</Text>
                <Text style={styles.summaryValue}>{selectedHaircut?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="person" size={20} color="#818cf8" />
                <Text style={styles.summaryLabel}>Coiffeur</Text>
                <Text style={styles.summaryValue}>{selectedBarber?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar" size={20} color="#818cf8" />
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{selectedDate} a {selectedTime}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{selectedHaircut?.price} EUR</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedSalon !== null;
      case 2: return selectedHaircut !== null;
      case 3: return selectedBarber !== null;
      case 4: return selectedDate !== null && selectedTime !== null;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s <= step && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={() => {
            if (step < 5) {
              setStep(step + 1);
            } else {
              handleBooking();
            }
          }}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Chargement...' : step === 5 ? 'Confirmer' : 'Continuer'}
          </Text>
          {step < 5 && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  progressDotActive: {
    backgroundColor: '#FFD700',
  },
  scrollContent: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 10,
    marginTop: 8,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#FFD700',
  },
  salonIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  priceTag: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  // Haircuts grid
  haircutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  haircutCard: {
    width: (width - 44) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  haircutCardSelected: {
    borderColor: '#FFD700',
  },
  haircutImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#334155',
  },
  haircutImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haircutInfo: {
    padding: 10,
  },
  haircutInfoSelected: {
    backgroundColor: '#FFD700',
  },
  haircutName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  haircutNameSelected: {
    color: '#0f172a',
  },
  haircutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  haircutDuration: {
    color: '#64748b',
    fontSize: 11,
  },
  haircutDurationSelected: {
    color: '#1e293b',
  },
  haircutPrice: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
  },
  haircutPriceSelected: {
    color: '#0f172a',
  },
  haircutCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  datesRow: {
    marginBottom: 8,
  },
  dateCard: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  dateDay: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dateNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  dateMonth: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dateTextSelected: {
    color: '#0f172a',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  timeSlotText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#0f172a',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#94a3b8',
    marginLeft: 12,
    flex: 1,
  },
  summaryValue: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});
