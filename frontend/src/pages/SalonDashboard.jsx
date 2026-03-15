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
  HelpCircle
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
    { icon: Scissors, label: "Coupes", path: "/salon/haircuts" },
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
  const [newBarber, setNewBarber] = useState({ name: "", specialties: "", bio: "" });

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
        specialties: newBarber.specialties ? newBarber.specialties.split(",").map(s => s.trim()).filter(s => s) : [],
        bio: newBarber.bio.trim() || null
      };
      
      await axios.post(`${API}/salons/${salonId}/barbers`, barberData, { withCredentials: true });
      toast.success("Coiffeur ajoute avec succes");
      setShowCreateDialog(false);
      setNewBarber({ name: "", specialties: "", bio: "" });
      fetchBarbers();
    } catch (error) {
      console.error("Error creating barber:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout du coiffeur");
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
          <DialogContent className="bg-slate-800 border-slate-700">
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
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Specialites (separees par des virgules)</label>
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
          {barbers.map((barber) => (
            <div 
              key={barber.barber_id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
              data-testid={`barber-card-${barber.barber_id}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                  {barber.image_url ? (
                    <img src={barber.image_url} alt={barber.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white">{barber.name}</h3>
                  <p className="text-slate-400 text-sm">{barber.specialties?.join(", ") || "Toutes coupes"}</p>
                </div>
              </div>
              {barber.bio && <p className="text-slate-400 text-sm">{barber.bio}</p>}
            </div>
          ))}
        </div>
      )}
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

// Haircuts Management Component
const HaircutsManagement = ({ salonId }) => {
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHaircut, setNewHaircut] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    duration_minutes: "30", 
    category: "classic" 
  });

  useEffect(() => {
    if (salonId) {
      fetchHaircuts();
    } else {
      setLoading(false);
    }
  }, [salonId]);

  const fetchHaircuts = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/haircuts`);
      setHaircuts(response.data);
    } catch (error) {
      console.error("Error fetching haircuts:", error);
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
      fetchHaircuts();
    } catch (error) {
      console.error("Error creating haircut:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout de la coupe");
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
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Galerie des Coupes</h1>
          <p className="text-slate-400">{haircuts.length} coupes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-haircut-btn">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une coupe
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter une coupe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom de la coupe *</label>
                <Input
                  placeholder="Ex: Degrade Classique"
                  value={newHaircut.name}
                  onChange={(e) => setNewHaircut({...newHaircut, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="haircut-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <Textarea
                  placeholder="Ex: Degrade progressif avec finition nette"
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : haircuts.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Scissors className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune coupe ajoutee</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {haircuts.map((haircut) => (
            <div 
              key={haircut.haircut_id}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
              data-testid={`haircut-card-${haircut.haircut_id}`}
            >
              <div className="h-48 bg-slate-700 flex items-center justify-center">
                {haircut.image_url ? (
                  <img src={haircut.image_url} alt={haircut.name} className="w-full h-full object-cover" />
                ) : (
                  <Scissors className="h-12 w-12 text-slate-600" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-white mb-2">{haircut.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{haircut.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">{haircut.price} EUR</span>
                  <span className="text-slate-500 text-sm">{haircut.duration_minutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
