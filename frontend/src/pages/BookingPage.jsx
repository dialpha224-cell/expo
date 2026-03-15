import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Scissors, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Star,
  Clock,
  User,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Check,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const BookingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Booking steps
  const [step, setStep] = useState(1);
  const [salons, setSalons] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected values
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedHaircut, setSelectedHaircut] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [clientNotes, setClientNotes] = useState("");
  
  // Available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

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
      const response = await axios.get(`${API}/salons`);
      setSalons(response.data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonData = async (salonId) => {
    try {
      const [barbersRes, haircutsRes] = await Promise.all([
        axios.get(`${API}/salons/${salonId}/barbers`),
        axios.get(`${API}/salons/${salonId}/haircuts`)
      ]);
      setBarbers(barbersRes.data);
      setHaircuts(haircutsRes.data);
    } catch (error) {
      console.error("Error fetching salon data:", error);
    }
  };

  const handleBooking = async () => {
    if (!selectedSalon || !selectedBarber || !selectedHaircut || !selectedDate || !selectedTime) {
      toast.error("Veuillez completer toutes les etapes");
      return;
    }

    try {
      const bookingData = {
        salon_id: selectedSalon.salon_id,
        barber_id: selectedBarber.barber_id,
        haircut_id: selectedHaircut.haircut_id,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        client_notes: clientNotes,
        client_photos: []
      };

      const response = await axios.post(`${API}/appointments`, bookingData, { 
        withCredentials: true 
      });

      if (paymentMethod === "stripe") {
        // Redirect to Stripe checkout
        const checkoutResponse = await axios.post(`${API}/payments/checkout`, {
          appointment_id: response.data.appointment_id,
          origin_url: window.location.origin
        }, { withCredentials: true });
        
        window.location.href = checkoutResponse.data.url;
      } else {
        // Cash payment - show confirmation
        toast.success("Reservation confirmee ! Paiement a effectuer au salon.");
        navigate(`/booking/confirmation/${response.data.appointment_id}`);
      }
    } catch (error) {
      toast.error("Erreur lors de la reservation");
      console.error("Booking error:", error);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedSalon) {
      toast.error("Veuillez selectionner un salon");
      return;
    }
    if (step === 2 && !selectedHaircut) {
      toast.error("Veuillez selectionner une coupe");
      return;
    }
    if (step === 3 && !selectedBarber) {
      toast.error("Veuillez selectionner un coiffeur");
      return;
    }
    if (step === 4 && (!selectedDate || !selectedTime)) {
      toast.error("Veuillez selectionner une date et une heure");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    { num: 1, label: "Salon" },
    { num: 2, label: "Coupe" },
    { num: 3, label: "Coiffeur" },
    { num: 4, label: "Date" },
    { num: 5, label: "Confirmation" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-indigo-500" />
              <span className="font-heading font-bold text-white">AfroCrown</span>
            </a>
            <span className="text-slate-400">Reservation</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </a>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step >= s.num 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${
                step >= s.num ? 'text-white' : 'text-slate-500'
              }`}>
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className={`h-5 w-5 mx-2 ${
                  step > s.num ? 'text-indigo-500' : 'text-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Salon */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-heading font-bold text-white">Choisissez votre salon</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : salons.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                  <p className="text-slate-400">Aucun salon disponible</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {salons.map((salon) => (
                    <div
                      key={salon.salon_id}
                      onClick={() => setSelectedSalon(salon)}
                      className={`bg-slate-800 border rounded-xl p-6 cursor-pointer transition-all hover-lift ${
                        selectedSalon?.salon_id === salon.salon_id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      data-testid={`salon-option-${salon.salon_id}`}
                    >
                      <h3 className="font-heading font-semibold text-white mb-2">{salon.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                        <MapPin className="h-4 w-4" />
                        {salon.address}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Star className="h-4 w-4 text-amber-500" />
                        {salon.rating || 4.8} ({salon.total_reviews || 0} avis)
                      </div>
                      {selectedSalon?.salon_id === salon.salon_id && (
                        <div className="mt-4 flex items-center gap-2 text-indigo-400">
                          <Check className="h-4 w-4" />
                          Selectionne
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Select Haircut */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-heading font-bold text-white">Choisissez votre coupe</h2>
              
              {haircuts.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                  <p className="text-slate-400">Aucune coupe disponible pour ce salon</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {haircuts.map((haircut) => (
                    <div
                      key={haircut.haircut_id}
                      onClick={() => setSelectedHaircut(haircut)}
                      className={`bg-slate-800 border rounded-xl overflow-hidden cursor-pointer transition-all hover-lift ${
                        selectedHaircut?.haircut_id === haircut.haircut_id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      data-testid={`haircut-option-${haircut.haircut_id}`}
                    >
                      <div className="h-32 bg-slate-700">
                        {haircut.image_url ? (
                          <img src={haircut.image_url} alt={haircut.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors className="h-8 w-8 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-white mb-1">{haircut.name}</h3>
                        <p className="text-slate-400 text-sm mb-2 line-clamp-1">{haircut.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-400 font-bold">{haircut.price} EUR</span>
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <Clock className="h-3 w-3" />
                            {haircut.duration_minutes} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Select Barber */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-heading font-bold text-white">Choisissez votre coiffeur</h2>
                <p className="text-slate-400 mt-1">Coiffeurs disponibles chez {selectedSalon?.name}</p>
              </div>
              
              {barbers.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                  <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun coiffeur disponible pour ce salon</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {barbers.map((barber) => (
                    <div
                      key={barber.barber_id}
                      onClick={() => setSelectedBarber(barber)}
                      className={`bg-slate-800 border rounded-xl p-5 cursor-pointer transition-all hover-lift ${
                        selectedBarber?.barber_id === barber.barber_id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      data-testid={`barber-option-${barber.barber_id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                          {barber.photo_url ? (
                            <img src={barber.photo_url} alt={barber.name} className="w-full h-full object-cover" />
                          ) : barber.image_url ? (
                            <img src={barber.image_url} alt={barber.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-10 w-10 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-white text-lg">{barber.name}</h3>
                          <p className="text-indigo-400 text-sm mt-0.5">{barber.specialty || barber.specialties?.join(", ") || "Coiffeur polyvalent"}</p>
                          {barber.experience_years && (
                            <p className="text-slate-500 text-sm mt-1">{barber.experience_years} ans d'experience</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-white text-sm font-medium">{barber.rating || 4.8}</span>
                            </div>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500 text-sm">{barber.total_reviews || 0} avis</span>
                          </div>
                        </div>
                        {selectedBarber?.barber_id === barber.barber_id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Select Date & Time */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-heading font-bold text-white">Choisissez la date et l'heure</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-400" />
                    Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={fr}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border border-slate-700"
                  />
                </div>
                
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    Heure
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        data-testid={`time-slot-${time}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h3 className="text-white font-medium mb-4">Notes (optionnel)</h3>
                <Textarea
                  placeholder="Decrivez vos attentes ou ajoutez des details..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="client-notes-input"
                />
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-heading font-bold text-white">Confirmez votre reservation</h2>
              
              {/* Summary */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Salon</span>
                  <span className="text-white font-medium">{selectedSalon?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Coupe</span>
                  <span className="text-white font-medium">{selectedHaircut?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Coiffeur</span>
                  <span className="text-white font-medium">{selectedBarber?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white font-medium">
                    {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Heure</span>
                  <span className="text-white font-medium">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400">Duree</span>
                  <span className="text-white font-medium">{selectedHaircut?.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-indigo-400 font-bold text-2xl">{selectedHaircut?.price} EUR</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Mode de paiement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === "cash"
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid="payment-cash"
                  >
                    <Banknote className={`h-8 w-8 ${paymentMethod === "cash" ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className={paymentMethod === "cash" ? 'text-white' : 'text-slate-400'}>
                      Payer au salon
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === "stripe"
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid="payment-stripe"
                  >
                    <CreditCard className={`h-8 w-8 ${paymentMethod === "stripe" ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className={paymentMethod === "stripe" ? 'text-white' : 'text-slate-400'}>
                      Payer en ligne
                    </span>
                  </button>
                </div>
              </div>

              {!user && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 text-sm">
                    Vous n'etes pas connecte. Votre reservation sera enregistree sans historique.
                    <button onClick={login} className="underline ml-1">Se connecter</button>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={prevStep}
            variant="outline"
            className={`border-slate-700 text-white hover:bg-slate-800 ${step === 1 ? 'invisible' : ''}`}
            data-testid="prev-step-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="next-step-btn"
            >
              Continuer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBooking}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="confirm-booking-btn"
            >
              {paymentMethod === "stripe" ? "Payer maintenant" : "Confirmer la reservation"}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
