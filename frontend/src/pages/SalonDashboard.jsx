import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Scissors,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Clock,
  DollarSign,
  CheckCircle,
  Store,
  ChevronDown,
  HelpCircle,
  Tag,
  Camera,
  Sparkles,
  Gift,
  QrCode,
  Image,
  MapPin,
  Home,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Trophy
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import OnboardingTutorial, { resetOnboarding } from "../components/OnboardingTutorial";
import NotificationBell from "../components/NotificationBell";
import PhotoUploader from "../components/PhotoUploader";
import PromotionsManager from "../components/PromotionsManager";
import PremiumServicesManager from "../components/PremiumServicesManager";
import LoyaltyScanner from "../components/LoyaltyScanner";
import LoyaltyConfigManager from "../components/LoyaltyConfigManager";
import MonthlyCutsManager from "../components/MonthlyCutsManager";
import AppointmentQRScanner from "../components/AppointmentQRScanner";
import ReassignClientModal from "../components/ReassignClientModal";
import WebsiteImporter from "../components/WebsiteImporter";
import AppointmentCalendar from "../components/AppointmentCalendar";
import SalonBadges from "../components/SalonBadges";
import InactiveClientReminders from "../components/InactiveClientReminders";
import VirtualQueue from "../components/VirtualQueue";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SalonDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salons, setSalons] = useState([]);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [salon, setSalon] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user?.role === 'founder') {
      // Fondateur: charger tous les salons
      fetchAllSalons();
    } else if (user?.salon_id) {
      // Proprietaire: charger son salon
      setSelectedSalonId(user.salon_id);
      fetchSalon(user.salon_id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSalonId) {
      fetchSalon(selectedSalonId);
    }
  }, [selectedSalonId]);

  const fetchAllSalons = async () => {
    try {
      const response = await axios.get(`${API}/salons`);
      setSalons(response.data);
      if (response.data.length > 0) {
        setSelectedSalonId(response.data[0].salon_id);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
    }
  };

  const fetchSalon = async (salonId) => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}`);
      setSalon(response.data);
    } catch (error) {
      console.error("Error fetching salon:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/salon" },
    { icon: Users, label: "Coiffeurs", path: "/salon/barbers" },
    { icon: Calendar, label: "Rendez-vous", path: "/salon/appointments" },
    { icon: Calendar, label: "Calendrier", path: "/salon/calendar" },
    { icon: Clock, label: "File d'attente", path: "/salon/queue" },
    { icon: Scissors, label: "Coupes & Tarifs", path: "/salon/haircuts" },
    { icon: Image, label: "Galerie Photos", path: "/salon/gallery" },
    { icon: Sparkles, label: "Soumettre Tendance", path: "/salon/submit-trend" },
    { icon: Gift, label: "Programme Fidélité", path: "/salon/loyalty" },
    { icon: Tag, label: "Promotions", path: "/salon/promotions" },
    { icon: ShoppingBag, label: "Produits", path: "/salon/products" },
    { icon: BarChart3, label: "Statistiques", path: "/salon/stats" },
    { icon: Trophy, label: "Badges & Performance", path: "/salon/badges" },
    { icon: Settings, label: "Paramètres", path: "/salon/settings" },
  ];

  const isActive = (path) => {
    if (path === "/salon") {
      return location.pathname === "/salon";
    }
    return location.pathname.startsWith(path);
  };

  // Si pas de salon selectionne et pas fondateur
  if (!selectedSalonId && user?.role !== 'founder') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center max-w-md">
          <Store className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-white mb-2">Aucun salon assigne</h2>
          <p className="text-slate-400 mb-6">Contactez l'administrateur pour vous assigner a un salon.</p>
          <Button onClick={() => navigate("/")} variant="outline" className="border-slate-700 text-white">
            Retour a l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Scissors className="h-8 w-8 text-indigo-500" />
              <div>
                <h1 className="font-heading font-bold text-white text-lg">AfroCrown</h1>
                <p className="text-xs text-slate-500">Espace Salon</p>
              </div>
            </div>
          </div>

          {/* Salon Selector (pour fondateur) */}
          {user?.role === 'founder' && salons.length > 0 && (
            <div className="p-4 border-b border-slate-800">
              <label className="text-xs text-slate-500 mb-2 block">Salon actif</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between border-slate-700 text-white bg-slate-800 hover:bg-slate-700">
                    <span className="truncate">{salon?.name || "Selectionner"}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700">
                  {salons.map((s) => (
                    <DropdownMenuItem 
                      key={s.salon_id}
                      onClick={() => setSelectedSalonId(s.salon_id)}
                      className="text-white hover:bg-slate-700 cursor-pointer"
                    >
                      {s.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Bouton Retour à l'accueil */}
            <button
              onClick={() => navigate('/')}
              className="sidebar-item w-full text-amber-400 hover:bg-amber-500/10 mb-2"
              data-testid="back-home-btn"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="h-px bg-slate-800 my-2"></div>
            
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`sidebar-item w-full ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Lien vers dashboard fondateur */}
            {user?.role === 'founder' && (
              <button
                onClick={() => navigate('/founder')}
                className="sidebar-item w-full text-indigo-400 hover:bg-indigo-500/10 mt-2"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile & Logout - Fixed at bottom */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 mb-3 px-2">
              <img 
                src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              data-testid="logout-btn"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button 
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Rechercher..."
                className="pl-10 bg-slate-800 border-slate-700 text-white"
                data-testid="search-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-slate-400 text-sm hidden sm:block">{salon?.name}</span>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <Routes>
            <Route index element={<SalonOverview salonId={selectedSalonId} />} />
            <Route path="barbers" element={<BarbersManagement salonId={selectedSalonId} />} />
            <Route path="appointments" element={<AppointmentsManagement salonId={selectedSalonId} />} />
            <Route path="calendar" element={<CalendarPage salonId={selectedSalonId} />} />
            <Route path="haircuts" element={<HaircutsManagement salonId={selectedSalonId} />} />
            <Route path="gallery" element={<PhotoGallery salonId={selectedSalonId} />} />
            <Route path="submit-trend" element={<SubmitTrendPage salonId={selectedSalonId} salon={salon} />} />
            <Route path="loyalty" element={<LoyaltyPage salonId={selectedSalonId} />} />
            <Route path="promotions" element={<PromotionsPage salonId={selectedSalonId} />} />
            <Route path="premium" element={<PremiumServicesPage salonId={selectedSalonId} />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="stats" element={<SalonStats salonId={selectedSalonId} />} />
            <Route path="badges" element={<SalonBadges salonId={selectedSalonId} />} />
            <Route path="settings" element={<SalonSettings salon={salon} onUpdate={() => fetchSalon(selectedSalonId)} />} />
          </Routes>
        </div>

        {/* Help Button */}
        <button
          onClick={() => {
            resetOnboarding();
            setShowOnboarding(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 z-30"
          data-testid="help-button"
          title="Voir le tutoriel"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      </main>

      {/* Onboarding Tutorial - only show one instance */}
      <OnboardingTutorial 
        userRole={user?.role || "salon_owner"} 
        onComplete={() => setShowOnboarding(false)}
        forceShow={showOnboarding}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Salon Overview Component
const SalonOverview = ({ salonId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [salonId]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <Store className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Selectionnez un salon pour voir les statistiques.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Coiffeurs", value: stats?.total_barbers || 0, icon: Users, color: "indigo" },
    { label: "Rendez-vous", value: stats?.total_appointments || 0, icon: Calendar, color: "amber" },
    { label: "En attente", value: stats?.pending_appointments || 0, icon: Clock, color: "orange" },
    { label: "Termines", value: stats?.completed_appointments || 0, icon: CheckCircle, color: "green" },
    { label: "Coupes", value: stats?.haircuts_count || 0, icon: Scissors, color: "purple" },
    { label: "Revenus", value: `${stats?.total_revenue?.toFixed(2) || 0} EUR`, icon: DollarSign, color: "emerald" },
  ];

  return (
    <div className="space-y-8" data-testid="salon-overview">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white mb-2">Tableau de bord</h1>
        <p className="text-slate-400">Vue d'ensemble du salon</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="stat-card hover-lift"
            data-testid={`stat-card-${stat.label.toLowerCase()}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-600/20`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Inactive Clients Section */}
      <InactiveClientReminders salonId={salonId} />
    </div>
  );
};

// Barbers Management Component
const BarbersManagement = ({ salonId }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({ 
    name: "", 
    email: "",
    phone: "",
    phone_visible: true,
    specialties: "", 
    expertise: "",
    bio: "",
    photo_url: "",
    role: "employee"
  });

  const roleLabels = {
    owner: { label: "Proprietaire", color: "text-purple-400 bg-purple-500/20" },
    employee: { label: "Employe", color: "text-blue-400 bg-blue-500/20" },
    volunteer: { label: "Benevole", color: "text-green-400 bg-green-500/20" },
    intern: { label: "Stagiaire", color: "text-amber-400 bg-amber-500/20" }
  };

  useEffect(() => {
    if (salonId) {
      fetchBarbers();
    } else {
      setLoading(false);
    }
  }, [salonId]);

  const fetchBarbers = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/barbers`);
      setBarbers(response.data);
    } catch (error) {
      console.error("Error fetching barbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBarber = async () => {
    if (!newBarber.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    
    try {
      const barberData = {
        name: newBarber.name.trim(),
        email: newBarber.email.trim() || null,
        phone: newBarber.phone.trim() || null,
        phone_visible: newBarber.phone_visible,
        specialties: newBarber.specialties ? newBarber.specialties.split(",").map(s => s.trim()).filter(s => s) : [],
        expertise: newBarber.expertise.trim() || null,
        bio: newBarber.bio.trim() || null,
        photo_url: newBarber.photo_url.trim() || null,
        role: newBarber.role
      };
      
      await axios.post(`${API}/salons/${salonId}/barbers`, barberData, { withCredentials: true });
      toast.success("Coiffeur ajouté avec succès");
      setShowCreateDialog(false);
      setNewBarber({ name: "", email: "", phone: "", phone_visible: true, specialties: "", expertise: "", bio: "", photo_url: "", role: "employee" });
      fetchBarbers();
    } catch (error) {
      console.error("Error creating barber:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout du coiffeur");
    }
  };

  const updateBarberAvailability = async (barberId, isAvailable, reason = null, redirectTo = null) => {
    try {
      await axios.put(`${API}/barbers/${barberId}/availability`, {
        is_available: isAvailable,
        unavailable_reason: reason,
        redirect_to_barber_id: redirectTo
      }, { withCredentials: true });
      toast.success(isAvailable ? "Coiffeur disponible" : "Coiffeur indisponible");
      fetchBarbers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const deleteBarber = async (barberId) => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer ce coiffeur ?")) return;
    
    try {
      await axios.delete(`${API}/barbers/${barberId}`, { withCredentials: true });
      toast.success("Coiffeur supprime");
      fetchBarbers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const updateBarber = async () => {
    if (!selectedBarber) return;
    
    try {
      await axios.put(`${API}/barbers/${selectedBarber.barber_id}`, {
        name: selectedBarber.name,
        email: selectedBarber.email,
        phone: selectedBarber.phone,
        phone_visible: selectedBarber.phone_visible,
        role: selectedBarber.role,
        bio: selectedBarber.bio,
        expertise: selectedBarber.expertise,
        photo_url: selectedBarber.photo_url,
        specialties: selectedBarber.specialties
      }, { withCredentials: true });
      toast.success("Coiffeur mis à jour");
      setShowEditDialog(false);
      fetchBarbers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer les coiffeurs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="barbers-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion des Coiffeurs</h1>
          <p className="text-slate-400">{barbers.length} coiffeurs</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-barber-btn">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un coiffeur
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter un coiffeur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Photo URL */}
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Photo du coiffeur (URL)</label>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={newBarber.photo_url}
                  onChange={(e) => setNewBarber({...newBarber, photo_url: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                {newBarber.photo_url && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={newBarber.photo_url} 
                      alt="Aperçu" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom *</label>
                <Input
                  placeholder="Ex: Marcus Johnson"
                  value={newBarber.name}
                  onChange={(e) => setNewBarber({...newBarber, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="barber-name-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@salon.com"
                    value={newBarber.email}
                    onChange={(e) => setNewBarber({...newBarber, email: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Téléphone</label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={newBarber.phone}
                    onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              {/* Visibilité téléphone */}
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                <input
                  type="checkbox"
                  id="phone_visible"
                  checked={newBarber.phone_visible}
                  onChange={(e) => setNewBarber({...newBarber, phone_visible: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="phone_visible" className="text-sm text-slate-300">
                  Afficher le téléphone aux clients
                </label>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Rôle</label>
                <Select value={newBarber.role} onValueChange={(v) => setNewBarber({...newBarber, role: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="owner" className="text-white">Propriétaire</SelectItem>
                    <SelectItem value="employee" className="text-white">Employé</SelectItem>
                    <SelectItem value="volunteer" className="text-white">Bénévole</SelectItem>
                    <SelectItem value="intern" className="text-white">Stagiaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Expertise principale</label>
                <Input
                  placeholder="Ex: Spécialiste dégradés et tresses"
                  value={newBarber.expertise}
                  onChange={(e) => setNewBarber({...newBarber, expertise: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Spécialités (séparées par virgules)</label>
                <Input
                  placeholder="Ex: Fade, Dégradé, Afro"
                  value={newBarber.specialties}
                  onChange={(e) => setNewBarber({...newBarber, specialties: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="barber-specialties-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Bio</label>
                <Textarea
                  placeholder="Ex: Expert en dégradés avec 10 ans d'expérience"
                  value={newBarber.bio}
                  onChange={(e) => setNewBarber({...newBarber, bio: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="barber-bio-input"
                />
              </div>
              <Button 
                onClick={createBarber} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="submit-barber-btn"
              >
                Ajouter le coiffeur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : barbers.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun coiffeur</h3>
          <p className="text-slate-400">Ajoutez votre premier coiffeur.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => {
            const roleConfig = roleLabels[barber.role] || roleLabels.employee;
            return (
              <div 
                key={barber.barber_id}
                className={`bg-slate-800 border rounded-xl p-6 transition-all ${
                  barber.is_available !== false ? "border-slate-700 hover:border-indigo-500/50" : "border-red-500/30 bg-slate-800/50"
                }`}
                data-testid={`barber-card-${barber.barber_id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center overflow-hidden">
                        {barber.image_url || barber.photo_url ? (
                          <img src={barber.image_url || barber.photo_url} alt={barber.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-indigo-400" />
                        )}
                      </div>
                      {/* Availability indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                        barber.is_available !== false ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-white">{barber.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.color}`}>
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem 
                        className="text-white cursor-pointer"
                        onClick={() => { setSelectedBarber(barber); setShowEditDialog(true); }}
                      >
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white cursor-pointer"
                        onClick={() => updateBarberAvailability(barber.barber_id, barber.is_available === false)}
                      >
                        {barber.is_available !== false ? "Marquer indisponible" : "Marquer disponible"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 cursor-pointer"
                        onClick={() => deleteBarber(barber.barber_id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-slate-400 text-sm mb-2">{barber.specialties?.join(", ") || "Toutes coupes"}</p>
                
                {barber.is_available === false && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-3">
                    <p className="text-red-400 text-xs">
                      Indisponible {barber.unavailable_reason && `- ${barber.unavailable_reason}`}
                    </p>
                  </div>
                )}
                
                {barber.rating > 0 && (
                  <div className="flex items-center gap-1 mt-3 text-amber-400">
                    <span className="text-sm">★</span>
                    <span className="text-sm">{barber.rating.toFixed(1)}</span>
                    <span className="text-slate-500 text-xs">({barber.total_reviews} avis)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Barber Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le coiffeur</DialogTitle>
          </DialogHeader>
          {selectedBarber && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom</label>
                <Input
                  value={selectedBarber.name}
                  onChange={(e) => setSelectedBarber({...selectedBarber, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={selectedBarber.email || ""}
                    onChange={(e) => setSelectedBarber({...selectedBarber, email: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Telephone</label>
                  <Input
                    value={selectedBarber.phone || ""}
                    onChange={(e) => setSelectedBarber({...selectedBarber, phone: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Role</label>
                <Select 
                  value={selectedBarber.role || "employee"} 
                  onValueChange={(v) => setSelectedBarber({...selectedBarber, role: v})}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="owner" className="text-white">Proprietaire</SelectItem>
                    <SelectItem value="employee" className="text-white">Employe</SelectItem>
                    <SelectItem value="volunteer" className="text-white">Benevole</SelectItem>
                    <SelectItem value="intern" className="text-white">Stagiaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={updateBarber} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Enregistrer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Appointments Management Component
const AppointmentsManagement = ({ salonId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassignAppointment, setReassignAppointment] = useState(null);

  useEffect(() => {
    if (salonId) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [salonId]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/appointments`, { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}/status`, { status }, { withCredentials: true });
      toast.success("Statut mis a jour");
      fetchAppointments();
    } catch (error) {
      toast.error("Erreur lors de la mise a jour");
    }
  };

  const requestReview = async (appointmentId) => {
    try {
      await axios.post(`${API}/appointments/${appointmentId}/request-review`, {}, { withCredentials: true });
      toast.success("Demande d'avis envoyee au client");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400"
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirme",
    in_progress: "En cours",
    completed: "Termine",
    cancelled: "Annule"
  };

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour voir les rendez-vous.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="appointments-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion des Rendez-vous</h1>
          <p className="text-slate-400">{appointments.length} rendez-vous</p>
        </div>
        <div className="flex gap-3">
          <AppointmentQRScanner salonId={salonId} onScanComplete={fetchAppointments} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun rendez-vous pour le moment</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Coiffeur</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Heure</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Prix</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {appointments.map((apt) => (
                  <tr key={apt.appointment_id} data-testid={`appointment-row-${apt.appointment_id}`}>
                    <td className="px-6 py-4 text-white">{apt.client_name || "Client anonyme"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{apt.barber_name || "-"}</span>
                        {apt.status !== "completed" && apt.status !== "cancelled" && (
                          <button
                            onClick={() => setReassignAppointment(apt)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                            data-testid={`reassign-btn-${apt.appointment_id}`}
                          >
                            Reassigner
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{apt.appointment_date || apt.date}</td>
                    <td className="px-6 py-4 text-slate-400">{apt.appointment_time || apt.time}</td>
                    <td className="px-6 py-4 text-white">{apt.total_price || apt.final_price} EUR</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Select value={apt.status} onValueChange={(value) => updateStatus(apt.appointment_id, value)}>
                          <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirme</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="completed">Termine</SelectItem>
                          <SelectItem value="cancelled">Annule</SelectItem>
                        </SelectContent>
                      </Select>
                        {apt.status === "completed" && !apt.is_reviewed && (
                          <button
                            onClick={() => requestReview(apt.appointment_id)}
                            className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded hover:bg-amber-600/30"
                            data-testid={`request-review-btn-${apt.appointment_id}`}
                          >
                            Demander avis
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      <ReassignClientModal
        appointment={reassignAppointment}
        isOpen={!!reassignAppointment}
        onClose={() => setReassignAppointment(null)}
        onReassigned={fetchAppointments}
      />
    </div>
  );
};

// Haircuts Management Component with Custom Pricing
const HaircutsManagement = ({ salonId }) => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newHaircut, setNewHaircut] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    duration_minutes: "30", 
    category: "classic" 
  });

  useEffect(() => {
    if (salonId) {
      fetchPricing();
    } else {
      setLoading(false);
    }
  }, [salonId]);

  const fetchPricing = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/pricing`);
      setPricing(response.data.pricing || []);
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const createHaircut = async () => {
    if (!newHaircut.name.trim() || !newHaircut.price) {
      toast.error("Le nom et le prix sont obligatoires");
      return;
    }
    
    try {
      const haircutData = {
        name: newHaircut.name.trim(),
        description: newHaircut.description.trim() || null,
        price: parseFloat(newHaircut.price),
        duration_minutes: parseInt(newHaircut.duration_minutes) || 30,
        category: newHaircut.category
      };
      
      await axios.post(`${API}/salons/${salonId}/haircuts`, haircutData, { withCredentials: true });
      toast.success("Coupe ajoutee avec succes");
      setShowCreateDialog(false);
      setNewHaircut({ name: "", description: "", price: "", duration_minutes: "30", category: "classic" });
      fetchPricing();
    } catch (error) {
      console.error("Error creating haircut:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout de la coupe");
    }
  };

  const updatePrice = async (haircutId, newPrice, isAvailable = true) => {
    try {
      await axios.put(
        `${API}/salons/${salonId}/pricing/${haircutId}`,
        { price: parseFloat(newPrice), is_available: isAvailable },
        { withCredentials: true }
      );
      toast.success("Prix mis a jour");
      setEditingPrice(null);
      fetchPricing();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const resetPrice = async (haircutId) => {
    try {
      await axios.delete(`${API}/salons/${salonId}/pricing/${haircutId}`, { withCredentials: true });
      toast.success("Prix reinitialise");
      fetchPricing();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const toggleAvailability = async (haircut) => {
    const newAvailability = !haircut.is_available;
    try {
      await axios.put(
        `${API}/salons/${salonId}/pricing/${haircut.haircut_id}`,
        { price: haircut.salon_price, is_available: newAvailability },
        { withCredentials: true }
      );
      toast.success(newAvailability ? "Coupe disponible" : "Coupe desactivee");
      fetchPricing();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer les coupes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="haircuts-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Tarifs & Coupes</h1>
          <p className="text-slate-400">{pricing.length} coupes disponibles</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-haircut-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle coupe
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter une coupe personnalisee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom de la coupe *</label>
                <Input
                  placeholder="Ex: Degrade Special Maison"
                  value={newHaircut.name}
                  onChange={(e) => setNewHaircut({...newHaircut, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="haircut-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <Textarea
                  placeholder="Ex: Notre signature avec finition premium"
                  value={newHaircut.description}
                  onChange={(e) => setNewHaircut({...newHaircut, description: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="haircut-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Prix (EUR) *</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={newHaircut.price}
                    onChange={(e) => setNewHaircut({...newHaircut, price: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="haircut-price-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Duree (min)</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={newHaircut.duration_minutes}
                    onChange={(e) => setNewHaircut({...newHaircut, duration_minutes: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="haircut-duration-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Categorie</label>
                <Select value={newHaircut.category} onValueChange={(v) => setNewHaircut({...newHaircut, category: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Categorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="classic">Classique</SelectItem>
                    <SelectItem value="fade">Degrade</SelectItem>
                    <SelectItem value="afro">Afro</SelectItem>
                    <SelectItem value="braids">Tresses</SelectItem>
                    <SelectItem value="locks">Locks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={createHaircut} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="submit-haircut-btn"
              >
                Ajouter la coupe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-indigo-400 mt-0.5" />
          <div>
            <p className="text-white font-medium">Tarification personnalisee</p>
            <p className="text-slate-400 text-sm">
              Definissez vos propres prix pour chaque coupe. Les clients verront vos tarifs lors de la reservation.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : pricing.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Scissors className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune coupe disponible</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left text-slate-400 font-medium p-4">Coupe</th>
                <th className="text-center text-slate-400 font-medium p-4">Duree</th>
                <th className="text-center text-slate-400 font-medium p-4">Prix de base</th>
                <th className="text-center text-slate-400 font-medium p-4">Votre prix</th>
                <th className="text-center text-slate-400 font-medium p-4">Statut</th>
                <th className="text-right text-slate-400 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pricing.map((haircut) => (
                <tr key={haircut.haircut_id} className={`${!haircut.is_available ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{haircut.name}</p>
                      <p className="text-slate-500 text-xs">{haircut.category}</p>
                      {haircut.is_salon_specific && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                          Coupe maison
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-slate-300">{haircut.duration_minutes} min</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-slate-500">{haircut.base_price} EUR</span>
                  </td>
                  <td className="p-4 text-center">
                    {editingPrice === haircut.haircut_id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          defaultValue={haircut.salon_price}
                          className="w-20 bg-slate-900 border-slate-600 text-white text-center"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updatePrice(haircut.haircut_id, e.target.value);
                            }
                            if (e.key === 'Escape') {
                              setEditingPrice(null);
                            }
                          }}
                          autoFocus
                        />
                        <span className="text-slate-400">EUR</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPrice(haircut.haircut_id)}
                        className={`font-bold ${
                          haircut.has_custom_price ? 'text-indigo-400' : 'text-white'
                        } hover:text-indigo-300 transition-colors`}
                        title="Cliquez pour modifier"
                      >
                        {haircut.salon_price} EUR
                        {haircut.has_custom_price && <span className="text-xs ml-1">*</span>}
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleAvailability(haircut)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        haircut.is_available 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {haircut.is_available ? 'Disponible' : 'Desactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    {haircut.has_custom_price && !haircut.is_salon_specific && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetPrice(haircut.haircut_id)}
                        className="text-slate-400 hover:text-white"
                        title="Reinitialiser au prix de base"
                      >
                        Reinitialiser
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-slate-500 text-sm">
        * Prix personnalise pour votre salon. Cliquez sur un prix pour le modifier.
      </p>
    </div>
  );
};

// Photo Gallery Component
const PhotoGallery = ({ salonId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (salonId) fetchPhotos();
  }, [salonId]);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/photos`);
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async () => {
    if (!newPhotoUrl.trim()) {
      toast.error("Veuillez entrer l'URL de l'image");
      return;
    }
    setUploading(true);
    try {
      await axios.post(`${API}/salons/${salonId}/photos`, {
        image_url: newPhotoUrl,
        description: newPhotoDesc
      }, { withCredentials: true });
      toast.success("Photo ajoutée à la galerie !");
      setShowUploadDialog(false);
      setNewPhotoUrl("");
      setNewPhotoDesc("");
      fetchPhotos();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm("Supprimer cette photo ?")) return;
    try {
      await axios.delete(`${API}/salons/${salonId}/photos/${photoId}`, { withCredentials: true });
      toast.success("Photo supprimée");
      fetchPhotos();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const monthlyCount = photos.filter(p => {
    const photoDate = new Date(p.created_at);
    const now = new Date();
    return photoDate.getMonth() === now.getMonth() && photoDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Galerie Photos</h1>
          <p className="text-slate-400">
            {monthlyCount}/10 photos ce mois-ci • Utilisez ces URLs pour soumettre vos tendances
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={monthlyCount >= 10}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une photo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter une photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">URL de l'image *</label>
                <Input
                  placeholder="https://exemple.com/photo.jpg"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                {newPhotoUrl && (
                  <div className="mt-2">
                    <img 
                      src={newPhotoUrl} 
                      alt="Aperçu" 
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description (optionnel)</label>
                <Input
                  placeholder="Ex: Dégradé américain"
                  value={newPhotoDesc}
                  onChange={(e) => setNewPhotoDesc(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <Button onClick={uploadPhoto} disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {uploading ? "Ajout en cours..." : "Ajouter à la galerie"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {monthlyCount >= 10 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">
            <Camera className="inline h-4 w-4 mr-2" />
            Vous avez atteint la limite de 10 photos ce mois-ci. Les nouvelles photos seront possibles le mois prochain.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement...</div>
      ) : photos.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <Image className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucune photo</h3>
          <p className="text-slate-400">Ajoutez des photos de vos réalisations pour les utiliser dans les tendances</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.photo_id} className="relative group">
              <img 
                src={photo.image_url} 
                alt={photo.description || "Photo"} 
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(photo.image_url);
                    toast.success("URL copiée !");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Copier l'URL
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deletePhoto(photo.photo_id)}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Supprimer
                </Button>
              </div>
              {photo.description && (
                <p className="text-xs text-slate-400 mt-1 truncate">{photo.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Submit Trend Page Component
const SubmitTrendPage = ({ salonId, salon }) => {
  const [photos, setPhotos] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    image_url: "",
    haircut_name: "",
    barber_name: "",
    message: "",
    client_consent: false
  });

  useEffect(() => {
    if (salonId) {
      fetchPhotos();
      fetchBarbers();
    }
  }, [salonId]);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/photos`);
      setPhotos(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/barbers`);
      setBarbers(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.image_url) {
      toast.error("Veuillez sélectionner ou coller une URL d'image");
      return;
    }
    if (!form.haircut_name.trim()) {
      toast.error("Veuillez entrer le nom de la coupe");
      return;
    }
    if (!form.barber_name.trim()) {
      toast.error("Veuillez entrer le nom du coiffeur");
      return;
    }
    if (!form.client_consent) {
      toast.error("L'accord du client est obligatoire");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/trends`, form, { withCredentials: true });
      toast.success("Votre création a été soumise ! Elle sera visible après validation.");
      setForm({ image_url: "", haircut_name: "", barber_name: "", message: "", client_consent: false });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-white mb-2">Soumettre une Tendance</h1>
        <p className="text-slate-400">Partagez vos plus belles créations avec la communauté AfroCrown</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 space-y-6">
        {/* Image Selection */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block font-medium">1. Sélectionner ou coller l'URL de l'image *</label>
          
          {/* Gallery Photos */}
          {photos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Choisir depuis votre galerie :</p>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {photos.map((photo) => (
                  <img
                    key={photo.photo_id}
                    src={photo.image_url}
                    alt=""
                    className={`w-full h-16 object-cover rounded cursor-pointer transition-all ${
                      form.image_url === photo.image_url ? 'ring-2 ring-amber-500' : 'hover:opacity-80'
                    }`}
                    onClick={() => setForm({...form, image_url: photo.image_url})}
                  />
                ))}
              </div>
            </div>
          )}
          
          <Input
            placeholder="https://exemple.com/ma-coupe.jpg"
            value={form.image_url}
            onChange={(e) => setForm({...form, image_url: e.target.value})}
            className="bg-slate-900 border-slate-700 text-white"
          />
          
          {form.image_url && (
            <div className="mt-3 flex justify-center">
              <img 
                src={form.image_url} 
                alt="Aperçu" 
                className="max-h-48 rounded-lg object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>

        {/* Salon Name (Auto-filled) */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block font-medium">2. Nom du salon</label>
          <Input
            value={salon?.name || ""}
            disabled
            className="bg-slate-900 border-slate-700 text-slate-400"
          />
        </div>

        {/* Barber Name */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block font-medium">3. Coiffeur qui a réalisé la coupe *</label>
          {barbers.length > 0 ? (
            <Select value={form.barber_name} onValueChange={(v) => setForm({...form, barber_name: v})}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Sélectionner un coiffeur" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {barbers.map((barber) => (
                  <SelectItem key={barber.barber_id} value={barber.name} className="text-white">
                    {barber.name}
                  </SelectItem>
                ))}
                <SelectItem value="other" className="text-slate-400">Autre...</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Nom du coiffeur"
              value={form.barber_name}
              onChange={(e) => setForm({...form, barber_name: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
            />
          )}
          {form.barber_name === "other" && (
            <Input
              placeholder="Entrer le nom du coiffeur"
              onChange={(e) => setForm({...form, barber_name: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white mt-2"
            />
          )}
        </div>

        {/* Haircut Name */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block font-medium">4. Nom de la coupe *</label>
          <Input
            placeholder="Ex: Dégradé américain, Tresses collées, Afro naturel..."
            value={form.haircut_name}
            onChange={(e) => setForm({...form, haircut_name: e.target.value})}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block font-medium">5. Message à la communauté (optionnel)</label>
          <Textarea
            placeholder="Partagez l'histoire de cette création, des conseils, ou un message pour la communauté..."
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            className="bg-slate-900 border-slate-700 text-white"
            rows={3}
          />
        </div>

        {/* Client Consent */}
        <div className="bg-slate-900 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.client_consent}
              onChange={(e) => setForm({...form, client_consent: e.target.checked})}
              className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <p className="text-white font-medium">J'ai l'accord du client *</p>
              <p className="text-sm text-slate-400">
                Je confirme avoir obtenu l'autorisation du client pour publier cette photo sur AfroCrown.
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={submitting || !form.client_consent}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-semibold py-6"
        >
          {submitting ? "Envoi en cours..." : "Soumettre ma création"}
        </Button>
      </div>
    </div>
  );
};

// Promotions Page Component
const PromotionsPage = ({ salonId }) => {
  const [haircuts, setHaircuts] = useState([]);

  useEffect(() => {
    if (salonId) {
      fetchHaircuts();
    }
  }, [salonId]);

  const fetchHaircuts = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/pricing`);
      setHaircuts(response.data.pricing || []);
    } catch (error) {
      console.error("Error fetching haircuts:", error);
    }
  };

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer les promotions.</p>
      </div>
    );
  }

  return <PromotionsManager salonId={salonId} haircuts={haircuts} />;
};

// Premium Services Page Component
const PremiumServicesPage = ({ salonId }) => {
  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer les services premium.</p>
      </div>
    );
  }

  return <PremiumServicesManager salonId={salonId} />;
};

// Monthly Cuts Page Component
const MonthlyCutsPage = ({ salonId }) => {
  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer les coupes du mois.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="monthly-cuts-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Coupes du Mois</h1>
          <p className="text-slate-400">Mettez en avant vos plus belles realisations</p>
        </div>
      </div>
      <MonthlyCutsManager salonId={salonId} />
    </div>
  );
};

// Loyalty Program Page Component
const LoyaltyPage = ({ salonId }) => {
  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour gerer le programme fidelite.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="loyalty-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Programme Fidelite</h1>
          <p className="text-slate-400">Fidelisez vos clients avec des recompenses</p>
        </div>
        <LoyaltyScanner salonId={salonId} />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <LoyaltyConfigManager salonId={salonId} />
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" />
            Comment ca marche ?
          </h3>
          <div className="space-y-4 text-slate-400 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <p>Le client presente son QR code (disponible dans l'app ou sur son compte)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <p>Scannez le QR code apres chaque coupe avec le bouton "Scanner Fidelite"</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
              <p>Un tampon est automatiquement ajoute a la carte du client</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">★</div>
              <p>Apres le nombre de tampons configure, le client gagne sa recompense !</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Page Component
const CalendarPage = ({ salonId }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  if (!salonId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour voir le calendrier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="calendar-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Calendrier</h1>
          <p className="text-slate-400">Vue mensuelle de vos rendez-vous</p>
        </div>
        <AppointmentQRScanner salonId={salonId} />
      </div>
      
      <AppointmentCalendar 
        salonId={salonId} 
        onSelectAppointment={setSelectedAppointment}
      />
    </div>
  );
};

// Products Management Component
const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    category: "hair_care",
    stock: "10"
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error("Le nom et le prix sont obligatoires");
      return;
    }
    
    try {
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || null,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0
      };
      
      await axios.post(`${API}/products`, productData, { withCredentials: true });
      toast.success("Produit ajoute avec succes");
      setShowCreateDialog(false);
      setNewProduct({ name: "", description: "", price: "", category: "hair_care", stock: "10" });
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout du produit");
    }
  };

  return (
    <div className="space-y-6" data-testid="products-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Produits</h1>
          <p className="text-slate-400">{products.length} produits</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-product-btn">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter un produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom du produit *</label>
                <Input
                  placeholder="Ex: Huile de Ricin"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="product-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <Textarea
                  placeholder="Ex: Huile 100% naturelle pour la pousse des cheveux"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="product-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Prix (EUR) *</label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Stock</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    data-testid="product-stock-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Categorie</label>
                <Select value={newProduct.category} onValueChange={(v) => setNewProduct({...newProduct, category: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Categorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="hair_care">Soins capillaires</SelectItem>
                    <SelectItem value="styling">Coiffage</SelectItem>
                    <SelectItem value="tools">Outils</SelectItem>
                    <SelectItem value="accessories">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={createProduct} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="submit-product-btn"
              >
                Ajouter le produit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun produit ajoute</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.product_id}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
              data-testid={`product-card-${product.product_id}`}
            >
              <div className="h-40 bg-slate-700 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="h-10 w-10 text-slate-600" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-white mb-1 text-sm">{product.name}</h3>
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">{product.price} EUR</span>
                  <span className="text-slate-500 text-xs">Stock: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Salon Stats Component
const CHART_COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const SalonStats = ({ salonId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    if (salonId) {
      fetchAnalytics();
    }
  }, [salonId, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/analytics/salon/${salonId}?days=${period}`, { withCredentials: true });
      setAnalytics(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des analytics");
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: 7, label: "7 derniers jours" },
    { value: 14, label: "14 derniers jours" },
    { value: 30, label: "30 derniers jours" },
    { value: 90, label: "3 derniers mois" },
    { value: 180, label: "6 derniers mois" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const { summary, daily_data, top_barbers, top_haircuts, hourly_distribution } = analytics;

  return (
    <div className="space-y-6" data-testid="salon-stats">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Statistiques & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Analyse détaillée de votre activité</p>
        </div>
        <Select value={period.toString()} onValueChange={(val) => setPeriod(parseInt(val))}>
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white" data-testid="period-selector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()} className="text-white hover:bg-slate-700">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-indigo-300 text-xs">Réservations</p>
              <p className="text-2xl font-bold text-white">{summary.total_bookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-300 text-xs">Revenus</p>
              <p className="text-2xl font-bold text-white">{summary.total_revenue}€</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-300 text-xs">Taux complétion</p>
              <p className="text-2xl font-bold text-white">{summary.completion_rate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-purple-300 text-xs">Panier moyen</p>
              <p className="text-2xl font-bold text-white">{summary.avg_booking_value}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings & Revenue Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Évolution des réservations
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={daily_data}>
              <defs>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 11}} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="bookings" stroke="#6366F1" fill="url(#bookingsGradient)" name="Réservations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Revenus journaliers
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={daily_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 11}} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
                formatter={(value) => [`${value}€`, 'Revenus']}
              />
              <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} name="Revenus (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Barbers */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Top Coiffeurs
          </h3>
          <div className="space-y-3">
            {top_barbers.length > 0 ? top_barbers.map((barber, idx) => (
              <div key={barber.barber_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-500 text-slate-900' : 
                    idx === 1 ? 'bg-slate-400 text-slate-900' : 
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-white text-sm">{barber.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-semibold">{barber.bookings} RDV</p>
                  <p className="text-slate-500 text-xs">{barber.revenue}€</p>
                </div>
              </div>
            )) : <p className="text-slate-500 text-sm">Aucune donnée</p>}
          </div>
        </div>

        {/* Top Haircuts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-400" />
            Coupes populaires
          </h3>
          <div className="space-y-3">
            {top_haircuts.length > 0 ? top_haircuts.map((haircut, idx) => (
              <div key={haircut.haircut_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-500 text-slate-900' : 
                    idx === 1 ? 'bg-slate-400 text-slate-900' : 
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-white text-sm truncate max-w-[120px]">{haircut.name}</span>
                </div>
                <span className="text-amber-400 font-semibold">{haircut.count}x</span>
              </div>
            )) : <p className="text-slate-500 text-sm">Aucune donnée</p>}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Heures populaires
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourly_distribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 10}} />
              <YAxis dataKey="hour" type="category" stroke="#64748B" tick={{fill: '#94A3B8', fontSize: 10}} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Réservations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Données détaillées</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Réservations</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Complétées</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Annulées</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenus</th>
              </tr>
            </thead>
            <tbody>
              {daily_data.slice(-14).reverse().map((day) => (
                <tr key={day.date} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white">{day.date}</td>
                  <td className="py-3 px-4 text-right text-indigo-400">{day.bookings}</td>
                  <td className="py-3 px-4 text-right text-green-400">{day.completed}</td>
                  <td className="py-3 px-4 text-right text-red-400">{day.cancelled}</td>
                  <td className="py-3 px-4 text-right text-amber-400">{day.revenue}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Salon Settings Component
const SalonSettings = ({ salon, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || "",
        address: salon.address || "",
        phone: salon.phone || "",
        description: salon.description || ""
      });
    }
  }, [salon]);

  const handleSubmit = async () => {
    if (!salon?.salon_id) return;
    
    setSaving(true);
    try {
      await axios.put(`${API}/salons/${salon.salon_id}`, formData, { withCredentials: true });
      toast.success("Parametres mis a jour");
      onUpdate();
    } catch (error) {
      toast.error("Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  };

  if (!salon) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400">Selectionnez un salon pour modifier ses parametres.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="salon-settings">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-white">Parametres du salon</h1>
        <WebsiteImporter salonId={salon?.salon_id} />
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Nom du salon</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="settings-name-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Adresse</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="settings-address-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Telephone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="settings-phone-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="settings-description-input"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
            data-testid="save-settings-btn"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalonDashboard;
