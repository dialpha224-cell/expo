import { useState, useEffect, useRef } from "react";
import { useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useLanguage, LanguageSelector } from "../context/LanguageContext";
import { 
  Scissors, 
  Calendar, 
  ShoppingBag, 
  Trophy, 
  Star, 
  Users, 
  ArrowRight,
  Play,
  Sparkles,
  LogOut,
  Mail,
  Lock,
  X,
  Heart,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Globe
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const LandingPage = () => {
  const { user, login, logout, loading, setUser } = useAuth();
  const { t } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Monthly Cuts Carousel State
  const [monthlyCuts, setMonthlyCuts] = useState([]);
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const carouselRef = useRef(null);
  
  // Location Search State
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Fetch monthly cuts and locations on mount
  useEffect(() => {
    fetchMonthlyCuts();
    fetchCountries();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (monthlyCuts.length > 1) {
      const interval = setInterval(() => {
        setCurrentCutIndex((prev) => (prev + 1) % monthlyCuts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [monthlyCuts.length]);

  const fetchMonthlyCuts = async () => {
    try {
      const response = await axios.get(`${API}/monthly-cuts/featured`);
      setMonthlyCuts(response.data);
    } catch (error) {
      console.log("No monthly cuts available");
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${API}/salons/locations/countries`);
      setCountries(response.data);
    } catch (error) {
      console.log("Error fetching countries");
    }
  };

  const fetchCities = async (country) => {
    try {
      const response = await axios.get(`${API}/salons/locations/cities?country=${country}`);
      setCities(response.data);
    } catch (error) {
      console.log("Error fetching cities");
    }
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedCity("");
    fetchCities(country);
  };

  const searchSalons = async () => {
    setIsSearching(true);
    try {
      let url = `${API}/salons/search?`;
      if (selectedCountry) url += `country=${selectedCountry}&`;
      if (selectedCity) url += `city=${selectedCity}&`;
      if (userLocation) {
        url += `latitude=${userLocation.lat}&longitude=${userLocation.lng}&radius_km=20`;
      }
      
      const response = await axios.get(url);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success("Position detectee !");
        },
        (error) => {
          toast.error("Impossible d'obtenir votre position");
        }
      );
    } else {
      toast.error("Geolocalisation non supportee");
    }
  };

  const likeMonthlyCut = async (cutId) => {
    try {
      await axios.post(`${API}/monthly-cuts/${cutId}/like`);
      setMonthlyCuts(prev => prev.map(cut => 
        cut.cut_id === cutId ? { ...cut, likes: (cut.likes || 0) + 1 } : cut
      ));
    } catch (error) {
      console.log("Error liking cut");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: loginForm.email,
        password: loginForm.password
      }, { withCredentials: true });
      
      setUser(response.data);
      setShowLoginDialog(false);
      setLoginForm({ email: "", password: "" });
      
      if (response.data.must_change_password) {
        setShowPasswordChange(true);
        toast.info("Veuillez changer votre mot de passe temporaire");
      } else {
        toast.success("Connexion reussie !");
        // Redirect based on role
        if (response.data.role === 'founder') {
          window.location.href = '/founder';
        } else if (response.data.role === 'salon_owner') {
          window.location.href = '/salon';
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    
    try {
      await axios.post(`${API}/auth/change-password`, {
        current_password: passwordForm.current,
        new_password: passwordForm.new
      }, { withCredentials: true });
      
      toast.success("Mot de passe modifie avec succes !");
      setShowPasswordChange(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
      
      // Redirect based on role
      if (user?.role === 'founder') {
        window.location.href = '/founder';
      } else if (user?.role === 'salon_owner') {
        window.location.href = '/salon';
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du changement de mot de passe");
    }
  };

  // Pas de redirection automatique - l'utilisateur choisit ou aller

  const features = [
    {
      icon: Calendar,
      title: "Reservation Simple",
      description: "Reservez votre coupe en quelques clics. Choisissez votre coiffeur et votre creneau."
    },
    {
      icon: Sparkles,
      title: "Simulation IA",
      description: "Visualisez votre future coupe grace a l'intelligence artificielle avant de vous decider."
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Decouvrez les meilleurs produits capillaires selectionnes par nos experts."
    },
    {
      icon: Trophy,
      title: "TrimConnect Battle",
      description: "Participez au concours de coiffure et votez pour vos styles preferes."
    }
  ];

  const stats = [
    { value: "500+", label: t("landing.stats.salons") },
    { value: "10K+", label: t("landing.stats.clients") },
    { value: "50+", label: t("landing.stats.styles") },
    { value: "4.9", label: t("landing.stats.rating") }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#3B82F6]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="scissors-glow">
                <Scissors className="h-8 w-8 text-[#3B82F6]" />
              </div>
              <span className="text-xl font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.features")}</a>
              <a href="/booking" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.booking")}</a>
              <a href="/ai-simulation" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.simulation")}</a>
              <a href="/marketplace" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.marketplace")}</a>
              <a href="/trimconnect" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.trimconnect")}</a>
              {user && user.role === 'client' && (
                <a href="/my-appointments" className="text-slate-300 hover:text-[#60A5FA] transition-colors">{t("nav.appointments")}</a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white text-sm hidden sm:block">{user.name}</span>
                  </div>
                  {/* Dashboard button - always show for founder/salon_owner */}
                  {(user.role === 'founder' || user.role === 'salon_owner') && (
                    <Button 
                      onClick={() => window.location.href = user.role === 'founder' ? '/founder' : '/salon'}
                      className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] text-white shadow-lg shadow-blue-500/25"
                      data-testid="dashboard-btn"
                    >
                      {user.role === 'founder' ? t("nav.admin") : t("nav.salon")}
                    </Button>
                  )}
                  <Button 
                    onClick={logout}
                    variant="outline"
                    className="border-[#3B82F6]/50 text-[#60A5FA] hover:bg-[#3B82F6]/10"
                    data-testid="logout-btn"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] text-white shadow-lg shadow-blue-500/25"
                  data-testid="login-btn"
                >
                  {t("nav.login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-[#0F172A]">
        {/* Barber Filigree with Glow Effect */}
        <div className="barber-filigree"></div>
        <div className="light-beam"></div>
        
        {/* Background Image with Blue Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1546641082-f149d4c3c907?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-[#1E293B]/85 to-[#0F172A]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#3B82F6]/20 border border-[#3B82F6]/40 rounded-full px-4 py-2 mb-8">
              <Trophy className="h-4 w-4 text-[#FFD700] pulse-subtle" />
              <span className="text-sm text-[#60A5FA]">{t("landing.badge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-white mb-6 tracking-tight">
              {t("landing.hero.title1")}
              <span className="block text-afro-gradient">
                {t("landing.hero.title2")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button 
                  onClick={() => window.location.href = user.role === 'founder' ? '/founder' : user.role === 'salon_owner' ? '/salon' : '/booking'}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all duration-300"
                  data-testid="go-dashboard-btn"
                >
                  {user.role === 'founder' ? t("landing.hero.cta_admin") : user.role === 'salon_owner' ? t("landing.hero.cta_salon") : t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/booking'}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all duration-300"
                  data-testid="get-started-btn"
                >
                  {t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="outline"
                className="border-[#FFD700]/60 text-[#FFD700] hover:bg-[#FFD700]/10 py-6 px-8 rounded-xl text-lg transition-all duration-300"
                onClick={() => setIsVideoPlaying(true)}
                data-testid="watch-video-btn"
              >
                <Play className="mr-2 h-5 w-5" />
                {t("landing.hero.demo")}
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-[#60A5FA] mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Une plateforme complète pour les clients et les professionnels de la coiffure afro.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1E293B] border border-[#3B82F6]/20 rounded-xl p-6 hover:border-[#3B82F6]/50 transition-all duration-300 hover-lift"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-[#3B82F6]/15 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-[slate-300] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TrimConnect CTA Section */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-[#1E293B] rounded-2xl p-8 md:p-12 overflow-hidden border border-[#3B82F6]/20"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-8 w-8 text-[#3B82F6] pulse-subtle" />
                  <span className="text-[#3B82F6] font-heading font-bold text-xl">TrimConnect Barber Battle</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                  Le plus grand concours de coiffure afro
                </h2>
                <p className="text-[slate-300] max-w-lg">
                  Montrez votre talent, gagnez des prix exceptionnels et rejoignez 
                  le Hall of Fame des meilleurs coiffeurs.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#60A5FA] hover:to-[#2563EB] text-white font-bold uppercase tracking-wider py-4 px-8 rounded-xl"
                  style={{ boxShadow: '0 0 20px rgba(212, 165, 92, 0.3)' }}
                  onClick={() => window.location.href = '/trimconnect'}
                  data-testid="join-battle-btn"
                >
                  Participer au concours
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#3B82F6]/50 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  onClick={() => window.location.href = '/trimconnect'}
                  data-testid="view-entries-btn"
                >
                  Voir les participations
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section - Client Photos */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#3B82F6]/15 border border-[#3B82F6]/30 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm text-[#3B82F6]">{t("gallery.title")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              {t("gallery.title")}
            </h2>
            <p className="text-[slate-300] max-w-2xl mx-auto">
              {t("gallery.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/gallery/client-mirror-1.png", alt: "Client satisfait devant miroir" },
              { src: "/gallery/client-cutting-2.png", alt: "Coupe en cours" },
              { src: "/gallery/client-afro-3.png", alt: "Client avec afro naturelle" },
              { src: "/gallery/client-waves-4.png", alt: "Client avec 360 waves" }
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group overflow-hidden rounded-xl aspect-square"
              >
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{image.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Cuts Carousel - Coupes du Mois */}
      {monthlyCuts.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-300">Selection du mois</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Les Plus Belles Coupes
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Decouvrez les realisations exceptionnelles de nos salons partenaires ce mois-ci.
              </p>
            </motion.div>

            {/* Carousel */}
            <div className="relative" ref={carouselRef}>
              <div className="overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCutIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-video md:aspect-[21/9] bg-slate-800 rounded-2xl overflow-hidden"
                  >
                    <img 
                      src={monthlyCuts[currentCutIndex]?.image_url}
                      alt={monthlyCuts[currentCutIndex]?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {monthlyCuts[currentCutIndex]?.salon_name}
                        </div>
                        {monthlyCuts[currentCutIndex]?.haircut_name && (
                          <div className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
                            {monthlyCuts[currentCutIndex]?.haircut_name}
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                        {monthlyCuts[currentCutIndex]?.title}
                      </h3>
                      {monthlyCuts[currentCutIndex]?.description && (
                        <p className="text-slate-300 text-sm md:text-base max-w-2xl">
                          {monthlyCuts[currentCutIndex]?.description}
                        </p>
                      )}
                      <button
                        onClick={() => likeMonthlyCut(monthlyCuts[currentCutIndex]?.cut_id)}
                        className="mt-4 flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
                        data-testid="like-cut-btn"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{monthlyCuts[currentCutIndex]?.likes || 0} likes</span>
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              {monthlyCuts.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentCutIndex((prev) => (prev - 1 + monthlyCuts.length) % monthlyCuts.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#1E293B]/80 hover:bg-[#3B82F6]/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors border border-[#3B82F6]/30"
                    data-testid="carousel-prev-btn"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentCutIndex((prev) => (prev + 1) % monthlyCuts.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1E293B]/80 hover:bg-[#3B82F6]/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors border border-[#3B82F6]/30"
                    data-testid="carousel-next-btn"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {monthlyCuts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCutIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentCutIndex ? "bg-[#3B82F6] w-8" : "bg-[#475569] hover:bg-[#64748B]"
                    }`}
                    data-testid={`carousel-dot-${index}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Salon Search by Location */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              {t("landing.search.title")}
            </h2>
            <p className="text-[slate-300] max-w-2xl mx-auto">
              {t("landing.search.subtitle")}
            </p>
          </motion.div>

          {/* Search Form */}
          <div className="bg-[#1E293B] border border-[#3B82F6]/20 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Country Select */}
              <div className="md:col-span-1">
                <label className="block text-[slate-300] text-sm mb-2">{t("landing.search.country")}</label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger className="bg-[#0F172A] border-[#3B82F6]/30 text-white" data-testid="country-select">
                    <Globe className="w-4 h-4 mr-2 text-[#3B82F6]" />
                    <SelectValue placeholder={t("landing.search.country")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#3B82F6]/30">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country} className="text-white hover:bg-[#3B82F6]/20">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Select */}
              <div className="md:col-span-1">
                <label className="block text-[slate-300] text-sm mb-2">{t("landing.search.city")}</label>
                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedCountry}>
                  <SelectTrigger className="bg-[#0F172A] border-[#3B82F6]/30 text-white" data-testid="city-select">
                    <MapPin className="w-4 h-4 mr-2 text-[#3B82F6]" />
                    <SelectValue placeholder={t("landing.search.city")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#3B82F6]/30">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city} className="text-white hover:bg-[#3B82F6]/20">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Geolocation Button */}
              <div className="md:col-span-1">
                <label className="block text-[slate-300] text-sm mb-2">Position</label>
                <Button
                  onClick={getUserLocation}
                  variant="outline"
                  className={`w-full ${userLocation ? "bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]" : "border-[#3B82F6]/50 text-[#3B82F6] hover:bg-[#3B82F6]/10"}`}
                  data-testid="geolocation-btn"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {userLocation ? "Position OK" : t("landing.search.locate")}
                </Button>
              </div>

              {/* Search Button */}
              <div className="md:col-span-1">
                <label className="block text-[slate-300] text-sm mb-2">&nbsp;</label>
                <Button
                  onClick={searchSalons}
                  disabled={isSearching || (!selectedCountry && !userLocation)}
                  className="w-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#60A5FA] hover:to-[#2563EB] text-white"
                  data-testid="search-salons-btn"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? t("common.loading") : t("landing.search.button")}
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              {searchResults.length === 0 ? (
                <p className="text-center text-[slate-300] py-8">
                  {t("landing.search.no_results")}. Essayez d'élargir votre recherche.
                </p>
              ) : (
                <>
                  <p className="text-[slate-300] mb-6 text-center">
                    {searchResults.length} {t("landing.search.results")}
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {searchResults.slice(0, 6).map((salon) => (
                      <motion.div
                        key={salon.salon_id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#1E293B] border border-[#3B82F6]/20 rounded-xl overflow-hidden hover:border-[#3B82F6]/50 transition-all duration-300 cursor-pointer hover-lift"
                        onClick={() => window.location.href = `/booking?salon=${salon.salon_id}`}
                        data-testid={`search-result-${salon.salon_id}`}
                      >
                        <div className="h-40 bg-[#334155] relative">
                          <img 
                            src={salon.image_url || `https://images.unsplash.com/photo-1549663369-22ac6b052faf?w=400`}
                            alt={salon.name}
                            className="w-full h-full object-cover"
                          />
                          {salon.distance_km && salon.distance_km < 9999 && (
                            <div className="absolute top-3 right-3 bg-[#0F172A]/80 text-[#3B82F6] text-xs font-medium px-2 py-1 rounded-full border border-[#3B82F6]/30">
                              {salon.distance_km} km
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-heading font-semibold text-white">{salon.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-[#3B82F6] fill-[#3B82F6]" />
                              <span className="text-white text-sm">{salon.rating?.toFixed(1) || "Nouveau"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[slate-300] text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{salon.city}{salon.country ? `, ${salon.country}` : ""}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#3B82F6]/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="scissors-glow">
                <Scissors className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <span className="text-lg font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-[slate-300] hover:text-[#3B82F6] transition-colors text-sm">{t("footer.about")}</a>
              <a href="#" className="text-[slate-300] hover:text-[#3B82F6] transition-colors text-sm">{t("footer.contact")}</a>
              <a href="#" className="text-[slate-300] hover:text-[#3B82F6] transition-colors text-sm">{t("footer.terms")}</a>
              <a href="#" className="text-[slate-300] hover:text-[#3B82F6] transition-colors text-sm">{t("footer.privacy")}</a>
            </div>
            <div className="text-[slate-300]/60 text-sm text-center">
              <p className="mb-2">© 2024 AfroCrown. {t("footer.rights")}</p>
              <p className="text-[#3B82F6] font-medium">Inspired by Kadj'</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-[#0F172A] rounded-2xl overflow-hidden border border-[#3B82F6]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 z-10 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full transition-colors"
                data-testid="close-video-btn"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative w-full h-full">
                <video
                  className="w-full h-full object-cover"
                  src="/afrocrown-demo.mp4"
                  autoPlay
                  loop
                  playsInline
                  controls
                />
                {/* Audio voiceover - plays with the video */}
                <audio
                  src="/afrocrown-voiceover.mp3"
                  autoPlay
                  className="hidden"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1E293B] border-[#3B82F6]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">{t("auth.login")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Google Login */}
            <Button 
              onClick={() => {
                setShowLoginDialog(false);
                login();
              }}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3"
              data-testid="google-login-btn"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.google_login")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3B82F6]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1E293B] text-[slate-300]">{t("auth.or")}</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-sm text-[slate-300] mb-1 block">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B82F6]/50" />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="pl-10 bg-[#0F172A] border-[#3B82F6]/30 text-white focus:border-[#3B82F6]"
                    data-testid="login-email-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[slate-300] mb-1 block">{t("auth.password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B82F6]/50" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="pl-10 bg-[#0F172A] border-[#3B82F6]/30 text-white focus:border-[#3B82F6]"
                    data-testid="login-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#60A5FA] hover:to-[#2563EB] text-white"
                data-testid="email-login-submit"
              >
                {loginLoading ? t("common.loading") : t("auth.submit")}
              </Button>
            </form>

            <p className="text-center text-xs text-[slate-300]/60">
              {t("auth.no_account")}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="bg-[#1E293B] border-[#3B82F6]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Changer votre mot de passe</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[slate-300] text-sm mb-4 text-center">
              Pour des raisons de securite, veuillez definir un nouveau mot de passe.
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Mot de passe temporaire</label>
                <Input
                  type="password"
                  placeholder="Mot de passe temporaire recu"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="current-password-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nouveau mot de passe</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 caracteres"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="new-password-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  placeholder="Repetez le nouveau mot de passe"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="confirm-password-input"
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="change-password-submit"
              >
                Changer le mot de passe
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
