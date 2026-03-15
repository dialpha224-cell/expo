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
  Camera
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
    { icon: Scissors, label: "Coupes & Tarifs", path: "/salon/haircuts" },
    { icon: Tag, label: "Promotions", path: "/salon/promotions" },
    { icon: ShoppingBag, label: "Produits", path: "/salon/products" },
    { icon: BarChart3, label: "Statistiques", path: "/salon/stats" },
    { icon: Settings, label: "Parametres", path: "/salon/settings" },
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

        <nav className="p-4 space-y-1">
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
        </nav>

        {/* Lien vers dashboard fondateur */}
        {user?.role === 'founder' && (
          <div className="px-4 py-2">
            <button
              onClick={() => navigate('/founder')}
              className="sidebar-item w-full text-indigo-400 hover:bg-indigo-500/10"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard Admin</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-4">
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
            <span>Deconnexion</span>
          </button>
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
            <Route path="haircuts" element={<HaircutsManagement salonId={selectedSalonId} />} />
            <Route path="promotions" element={<PromotionsPage salonId={selectedSalonId} />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="stats" element={<SalonStats salonId={selectedSalonId} />} />
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
    specialties: "", 
    bio: "",
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
        specialties: newBarber.specialties ? newBarber.specialties.split(",").map(s => s.trim()).filter(s => s) : [],
        bio: newBarber.bio.trim() || null,
        role: newBarber.role
      };
      
      await axios.post(`${API}/salons/${salonId}/barbers`, barberData, { withCredentials: true });
      toast.success("Coiffeur ajoute avec succes");
      setShowCreateDialog(false);
      setNewBarber({ name: "", email: "", phone: "", specialties: "", bio: "", role: "employee" });
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
        role: selectedBarber.role,
        bio: selectedBarber.bio,
        specialties: selectedBarber.specialties
      }, { withCredentials: true });
      toast.success("Coiffeur mis a jour");
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
          <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter un coiffeur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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
                  <label className="text-sm text-slate-400 mb-1 block">Telephone</label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={newBarber.phone}
                    onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Role</label>
                <Select value={newBarber.role} onValueChange={(v) => setNewBarber({...newBarber, role: v})}>
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
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Specialites (separees par virgules)</label>
                <Input
                  placeholder="Ex: Fade, Degrade, Afro"
                  value={newBarber.specialties}
                  onChange={(e) => setNewBarber({...newBarber, specialties: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="barber-specialties-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Bio</label>
                <Textarea
                  placeholder="Ex: Expert en degrades avec 10 ans d'experience"
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

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400"
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirme",
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
      <div>
        <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion des Rendez-vous</h1>
        <p className="text-slate-400">{appointments.length} rendez-vous</p>
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
                    <td className="px-6 py-4 text-slate-400">{apt.appointment_date}</td>
                    <td className="px-6 py-4 text-slate-400">{apt.appointment_time}</td>
                    <td className="px-6 py-4 text-white">{apt.total_price} EUR</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Select value={apt.status} onValueChange={(value) => updateStatus(apt.appointment_id, value)}>
                        <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirme</SelectItem>
                          <SelectItem value="completed">Termine</SelectItem>
                          <SelectItem value="cancelled">Annule</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
const SalonStats = ({ salonId }) => {
  return (
    <div className="space-y-6" data-testid="salon-stats">
      <h1 className="text-2xl font-heading font-bold text-white">Statistiques</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Statistiques detaillees a venir</p>
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
      <h1 className="text-2xl font-heading font-bold text-white">Parametres du salon</h1>
      
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
