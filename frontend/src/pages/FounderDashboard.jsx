import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  BarChart3, 
  Trophy, 
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Scissors,
  ChevronRight,
  Search,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
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
import OnboardingTutorial, { resetOnboarding } from "../components/OnboardingTutorial";
import NotificationBell from "../components/NotificationBell";

const FounderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/founder" },
    { icon: Store, label: "Salons", path: "/founder/salons" },
    { icon: CalendarCheck, label: "Reservations", path: "/founder/reservations" },
    { icon: Users, label: "Utilisateurs", path: "/founder/users" },
    { icon: BarChart3, label: "Statistiques", path: "/founder/stats" },
    { icon: Trophy, label: "TrimConnect", path: "/founder/trimconnect" },
    { icon: Settings, label: "Parametres", path: "/founder/settings" },
  ];

  const isActive = (path) => {
    if (path === "/founder") {
      return location.pathname === "/founder";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Scissors className="h-8 w-8 text-indigo-500" />
            <div>
              <h1 className="font-heading font-bold text-white text-lg">AfroCrown</h1>
              <p className="text-xs text-slate-500">Espace Fondateur</p>
            </div>
          </div>
        </div>

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
            <span className="text-slate-400 text-sm hidden sm:block">Bienvenue, {user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <Routes>
            <Route index element={<FounderOverview />} />
            <Route path="salons" element={<SalonsManagement />} />
            <Route path="reservations" element={<ReservationsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="stats" element={<GlobalStats />} />
            <Route path="trimconnect" element={<TrimConnectManagement />} />
            <Route path="settings" element={<FounderSettings />} />
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
        userRole="founder" 
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

// Founder Overview Component
const FounderOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/founder/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Salons", value: stats?.total_salons || 0, icon: Store, color: "indigo" },
    { label: "Coiffeurs", value: stats?.total_barbers || 0, icon: Scissors, color: "amber" },
    { label: "Clients", value: stats?.total_clients || 0, icon: Users, color: "green" },
    { label: "Rendez-vous", value: stats?.total_appointments || 0, icon: Calendar, color: "purple" },
    { label: "Produits", value: stats?.total_products || 0, icon: ShoppingBag, color: "pink" },
    { label: "Revenus", value: `${stats?.total_revenue?.toFixed(2) || 0} EUR`, icon: TrendingUp, color: "emerald" },
  ];

  return (
    <div className="space-y-8" data-testid="founder-overview">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white mb-2">Tableau de bord</h1>
        <p className="text-slate-400">Vue globale de la plateforme AfroCrown</p>
      </div>

      {/* Stats Grid */}
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
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </div>
            <div className="text-2xl font-heading font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TrimConnect Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-heading font-bold text-white">TrimConnect Barber Battle</h2>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {stats?.trimconnect?.total_entries || 0}
            </div>
            <div className="text-slate-400">Participations</div>
          </div>
          <div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {stats?.trimconnect?.total_votes || 0}
            </div>
            <div className="text-slate-400">Votes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Salons Management Component
const SalonsManagement = () => {
  const [salons, setSalons] = useState([]);
  const [pendingSalons, setPendingSalons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [newSalon, setNewSalon] = useState({ name: "", address: "", phone: "", description: "" });
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalons();
    fetchPendingSalons();
    fetchUsers();
  }, []);

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

  const fetchPendingSalons = async () => {
    try {
      const response = await axios.get(`${API}/founder/salons/pending`, { withCredentials: true });
      setPendingSalons(response.data);
    } catch (error) {
      console.error("Error fetching pending salons:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/founder/users`, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const approveSalon = async (salonId) => {
    try {
      await axios.put(`${API}/founder/salons/${salonId}/approve`, {}, { withCredentials: true });
      toast.success("Salon approuvé et maintenant visible !");
      fetchSalons();
      fetchPendingSalons();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const rejectSalon = async (salonId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter ce salon ? Cette action supprimera le salon et le compte propriétaire.")) {
      return;
    }
    try {
      await axios.put(`${API}/founder/salons/${salonId}/reject`, {}, { withCredentials: true });
      toast.success("Salon rejeté et supprimé");
      fetchPendingSalons();
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const createSalon = async () => {
    try {
      await axios.post(`${API}/salons`, newSalon, { withCredentials: true });
      toast.success("Salon cree avec succes");
      setShowCreateDialog(false);
      setNewSalon({ name: "", address: "", phone: "", description: "" });
      fetchSalons();
    } catch (error) {
      toast.error("Erreur lors de la creation du salon");
    }
  };

  const assignOwner = async (userId) => {
    if (!selectedSalon) return;
    try {
      await axios.put(`${API}/salons/${selectedSalon.salon_id}/owner`, { owner_id: userId }, { withCredentials: true });
      toast.success("Proprietaire assigne avec succes");
      setShowAssignDialog(false);
      setSelectedSalon(null);
      fetchSalons();
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
    }
  };

  const getOwnerName = (ownerId) => {
    if (!ownerId) return null;
    const owner = users.find(u => u.user_id === ownerId);
    return owner ? owner.name : null;
  };

  return (
    <div className="space-y-6" data-testid="salons-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion des Salons</h1>
          <p className="text-slate-400">{salons.length} salons actifs · {pendingSalons.length} en attente</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-salon-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau salon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Creer un nouveau salon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nom du salon"
                value={newSalon.name}
                onChange={(e) => setNewSalon({...newSalon, name: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
                data-testid="salon-name-input"
              />
              <Input
                placeholder="Adresse"
                value={newSalon.address}
                onChange={(e) => setNewSalon({...newSalon, address: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
                data-testid="salon-address-input"
              />
              <Input
                placeholder="Telephone"
                value={newSalon.phone}
                onChange={(e) => setNewSalon({...newSalon, phone: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
                data-testid="salon-phone-input"
              />
              <Input
                placeholder="Description"
                value={newSalon.description}
                onChange={(e) => setNewSalon({...newSalon, description: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
                data-testid="salon-description-input"
              />
              <Button 
                onClick={createSalon} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="submit-salon-btn"
              >
                Creer le salon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'active' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Salons actifs ({salons.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
            activeTab === 'pending' 
              ? 'bg-amber-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          En attente de validation
          {pendingSalons.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingSalons.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Salons Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingSalons.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucune demande en attente</h3>
              <p className="text-slate-400">Tous les salons ont été traités</p>
            </div>
          ) : (
            pendingSalons.map((salon) => (
              <div key={salon.salon_id} className="bg-slate-800 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Store className="h-6 w-6 text-amber-500" />
                      <h3 className="text-xl font-semibold text-white">{salon.name}</h3>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
                        En attente
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4">
                      <div>
                        <span className="text-slate-500">Ville:</span> {salon.city}, {salon.country}
                      </div>
                      <div>
                        <span className="text-slate-500">Adresse:</span> {salon.address || 'Non renseignée'}
                      </div>
                      <div>
                        <span className="text-slate-500">Téléphone:</span> {salon.phone || 'Non renseigné'}
                      </div>
                      <div>
                        <span className="text-slate-500">Description:</span> {salon.description || 'Aucune'}
                      </div>
                    </div>
                    {salon.owner && (
                      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-300 font-medium mb-1">Propriétaire demandeur :</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{salon.owner.name}</span>
                          <span>{salon.owner.email}</span>
                          <span>{salon.owner.phone || 'Pas de téléphone'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      onClick={() => approveSalon(salon.salon_id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button 
                      onClick={() => rejectSalon(salon.salon_id)}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Salons Tab */}
      {activeTab === 'active' && (
        <>
          {/* Assign Owner Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Assigner un proprietaire</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-slate-400 mb-4">
              Salon : <span className="text-white font-medium">{selectedSalon?.name}</span>
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Selectionnez un utilisateur pour le nommer proprietaire de ce salon. 
              Il pourra ensuite gerer les coiffeurs, coupes et rendez-vous.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.filter(u => u.role !== 'founder').map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => assignOwner(user.user_id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-700 transition-colors text-left"
                  data-testid={`assign-user-${user.user_id}`}
                >
                  <img 
                    src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                  </div>
                  {user.role === 'salon_owner' && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full">
                      Proprietaire
                    </span>
                  )}
                </button>
              ))}
              {users.filter(u => u.role !== 'founder').length === 0 && (
                <p className="text-slate-500 text-center py-4">Aucun utilisateur disponible</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : salons.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Store className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun salon</h3>
          <p className="text-slate-400 mb-4">Commencez par creer votre premier salon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <div 
              key={salon.salon_id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
              data-testid={`salon-card-${salon.salon_id}`}
            >
              <h3 className="font-heading font-semibold text-white mb-2">{salon.name}</h3>
              <p className="text-slate-400 text-sm mb-2">{salon.address}</p>
              <p className="text-slate-500 text-sm mb-4">{salon.phone}</p>
              
              {/* Owner Info */}
              <div className="bg-slate-900 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1">Proprietaire</p>
                {salon.owner_id ? (
                  <p className="text-white text-sm font-medium">{getOwnerName(salon.owner_id) || 'Utilisateur assigne'}</p>
                ) : (
                  <p className="text-amber-400 text-sm">Non assigne</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSalon(salon);
                    setShowAssignDialog(true);
                  }}
                  className="flex-1 border-slate-700 text-white hover:bg-slate-700"
                  data-testid={`assign-owner-btn-${salon.salon_id}`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  {salon.owner_id ? 'Changer' : 'Assigner'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/salon')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  data-testid={`manage-salon-btn-${salon.salon_id}`}
                >
                  Gerer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};

// Reservations Management Component
const ReservationsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", salon_id: "" });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchSalons();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      let url = `${API}/founder/appointments?limit=100`;
      if (filter.status) url += `&status=${filter.status}`;
      if (filter.salon_id) url += `&salon_id=${filter.salon_id}`;
      
      const response = await axios.get(url, { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalons = async () => {
    try {
      const response = await axios.get(`${API}/salons`);
      setSalons(response.data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/founder/appointments/${appointmentId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      toast.success("Statut mis a jour");
      fetchAppointments();
    } catch (error) {
      toast.error("Erreur lors de la mise a jour");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr;
  };

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400"
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmee",
    completed: "Terminee",
    cancelled: "Annulee"
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle
  };

  return (
    <div className="space-y-6" data-testid="reservations-management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Reservations</h1>
          <p className="text-slate-400">{appointments.length} reservations</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            data-testid="status-filter"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmees</option>
            <option value="completed">Terminees</option>
            <option value="cancelled">Annulees</option>
          </select>
          <select
            value={filter.salon_id}
            onChange={(e) => setFilter({...filter, salon_id: e.target.value})}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            data-testid="salon-filter"
          >
            <option value="">Tous les salons</option>
            {salons.map(s => (
              <option key={s.salon_id} value={s.salon_id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Details de la reservation</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Client</p>
                  <p className="text-white font-medium">{selectedAppointment.client_name}</p>
                  <p className="text-slate-400 text-sm">{selectedAppointment.client_email}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Salon</p>
                  <p className="text-white font-medium">{selectedAppointment.salon_name}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Coiffeur</p>
                  <p className="text-white font-medium">{selectedAppointment.barber_name}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Coupe</p>
                  <p className="text-white font-medium">{selectedAppointment.haircut_name}</p>
                  <p className="text-indigo-400 text-sm">{selectedAppointment.haircut_price} EUR</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Date</p>
                  <p className="text-white font-medium">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Heure</p>
                  <p className="text-white font-medium">{selectedAppointment.time_slot}</p>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-2">Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "confirmed", "completed", "cancelled"].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        updateStatus(selectedAppointment.appointment_id, status);
                        setSelectedAppointment({...selectedAppointment, status});
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedAppointment.status === status 
                          ? statusColors[status] + " ring-2 ring-white/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedAppointment(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <CalendarCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucune reservation</h3>
          <p className="text-slate-400">Les reservations des clients apparaitront ici.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Client</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Salon</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Coiffeur</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Date</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Heure</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Statut</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const StatusIcon = statusIcons[apt.status] || Clock;
                  return (
                    <tr 
                      key={apt.appointment_id} 
                      className="border-b border-slate-700/50 hover:bg-slate-700/20"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{apt.client_name}</p>
                        <p className="text-slate-500 text-sm">{apt.client_email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{apt.salon_name}</td>
                      <td className="px-6 py-4 text-slate-300">{apt.barber_name}</td>
                      <td className="px-6 py-4 text-slate-300">{formatDate(apt.date)}</td>
                      <td className="px-6 py-4 text-slate-300">{apt.time_slot}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedAppointment(apt)}
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-700"
                          data-testid={`view-apt-${apt.appointment_id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Users Management Component
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "client", salon_id: "" });

  useEffect(() => {
    fetchUsers();
    fetchSalons();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/founder/users`, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalons = async () => {
    try {
      const response = await axios.get(`${API}/salons`);
      setSalons(response.data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    }
  };

  const createUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Le nom et l'email sont obligatoires");
      return;
    }
    
    try {
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        salon_id: newUser.role === 'salon_owner' && newUser.salon_id ? newUser.salon_id : null
      };
      
      const response = await axios.post(`${API}/founder/users`, userData, { withCredentials: true });
      setCreatedUser(response.data);
      setShowCreateDialog(false);
      setShowPasswordDialog(true);
      setNewUser({ name: "", email: "", role: "client", salon_id: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la creation");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cet utilisateur ?")) return;
    
    try {
      await axios.delete(`${API}/founder/users/${userId}`, { withCredentials: true });
      toast.success("Utilisateur supprime");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/founder/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      toast.success("Role mis a jour");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la mise a jour");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copie dans le presse-papier");
  };

  const roleColors = {
    founder: "bg-amber-500/20 text-amber-400",
    salon_owner: "bg-indigo-500/20 text-indigo-400",
    client: "bg-slate-500/20 text-slate-400"
  };

  const roleLabels = {
    founder: "Fondateur",
    salon_owner: "Proprietaire",
    client: "Client"
  };

  return (
    <div className="space-y-6" data-testid="users-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion des Utilisateurs</h1>
          <p className="text-slate-400">{users.length} utilisateurs enregistres</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-user-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Creer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom complet *</label>
                <Input
                  placeholder="Ex: Jean Dupont"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="user-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="user-email-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white"
                  data-testid="user-role-select"
                >
                  <option value="client">Client</option>
                  <option value="salon_owner">Proprietaire de salon</option>
                </select>
              </div>
              {newUser.role === 'salon_owner' && salons.length > 0 && (
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Assigner a un salon</label>
                  <select
                    value={newUser.salon_id}
                    onChange={(e) => setNewUser({...newUser, salon_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white"
                    data-testid="user-salon-select"
                  >
                    <option value="">-- Selectionner un salon --</option>
                    {salons.map(s => (
                      <option key={s.salon_id} value={s.salon_id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="bg-slate-900 rounded-lg p-3 text-sm text-slate-400">
                <p>Un mot de passe temporaire sera genere. L'utilisateur devra le changer a la premiere connexion.</p>
              </div>
              <Button 
                onClick={createUser} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="submit-user-btn"
              >
                Creer l'utilisateur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Utilisateur cree avec succes</DialogTitle>
          </DialogHeader>
          {createdUser && (
            <div className="space-y-4 mt-4">
              {createdUser.email_sent ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-green-400 font-medium">Email envoye !</p>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Un email a ete envoye a <span className="text-white font-medium">{createdUser.email}</span> avec un lien pour creer son mot de passe.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-amber-400 font-medium">Compte cree (email non envoye)</p>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">
                    L'utilisateur a ete cree mais l'email n'a pas pu etre envoye. Vous devrez lui transmettre le lien manuellement.
                  </p>
                </div>
              )}
              
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-slate-400 text-xs mb-2">Details de l'utilisateur :</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">Nom:</span> <span className="text-white">{createdUser.name}</span></p>
                  <p><span className="text-slate-500">Email:</span> <span className="text-white">{createdUser.email}</span></p>
                  <p><span className="text-slate-500">Role:</span> <span className="text-white">{roleLabels[createdUser.role]}</span></p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowPasswordDialog(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.user_id} data-testid={`user-row-${user.user_id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.user_id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white text-sm"
                        data-testid={`role-select-${user.user_id}`}
                      >
                        <option value="client">Client</option>
                        <option value="salon_owner">Proprietaire</option>
                        <option value="founder">Fondateur</option>
                      </select>
                      {user.role !== 'founder' && (
                        <button
                          onClick={() => deleteUser(user.user_id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Supprimer"
                          data-testid={`delete-user-${user.user_id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Global Stats Component
const GlobalStats = () => {
  return (
    <div className="space-y-6" data-testid="global-stats">
      <h1 className="text-2xl font-heading font-bold text-white">Statistiques Globales</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Statistiques detaillees a venir</p>
      </div>
    </div>
  );
};

// TrimConnect Management Component
const TrimConnectManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API}/trimconnect/entries`);
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (entryId, status) => {
    try {
      await axios.put(`${API}/trimconnect/entries/${entryId}/status`, { status }, { withCredentials: true });
      toast.success("Statut mis a jour");
      fetchEntries();
    } catch (error) {
      toast.error("Erreur lors de la mise a jour");
    }
  };

  return (
    <div className="space-y-6" data-testid="trimconnect-management">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white mb-2">Gestion TrimConnect</h1>
        <p className="text-slate-400">{entries.length} participations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune participation pour le moment</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div 
              key={entry.entry_id}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
              data-testid={`entry-card-${entry.entry_id}`}
            >
              <div className="h-48 bg-slate-700">
                <img 
                  src={entry.image_url}
                  alt={entry.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-white mb-2">{entry.title}</h3>
                <p className="text-slate-400 text-sm mb-2">{entry.barber_name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-medium">{entry.votes} votes</span>
                  <select
                    value={entry.status}
                    onChange={(e) => updateStatus(entry.entry_id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuve</option>
                    <option value="finalist">Finaliste</option>
                    <option value="winner">Gagnant</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Founder Settings Component
const FounderSettings = () => {
  return (
    <div className="space-y-6" data-testid="founder-settings">
      <h1 className="text-2xl font-heading font-bold text-white">Parametres</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <Settings className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Parametres de la plateforme a venir</p>
      </div>
    </div>
  );
};

export default FounderDashboard;
