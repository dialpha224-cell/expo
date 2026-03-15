import { useState } from "react";
import { useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
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
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const LandingPage = () => {
  const { user, login, logout, loading, setUser } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [loginLoading, setLoginLoading] = useState(false);

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
    { value: "500+", label: "Salons partenaires" },
    { value: "10K+", label: "Clients satisfaits" },
    { value: "50+", label: "Styles disponibles" },
    { value: "4.9", label: "Note moyenne" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Fonctionnalites</a>
              <a href="/booking" className="text-slate-400 hover:text-white transition-colors">Reserver</a>
              <a href="/ai-simulation" className="text-slate-400 hover:text-white transition-colors">Simulation IA</a>
              <a href="/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</a>
              <a href="/trimconnect" className="text-slate-400 hover:text-white transition-colors">TrimConnect</a>
              {user && user.role === 'client' && (
                <a href="/my-appointments" className="text-slate-400 hover:text-white transition-colors">Mes RDV</a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white text-sm hidden sm:block">{user.name}</span>
                  </div>
                  {/* Dashboard button - always show for founder/salon_owner */}
                  {(user.role === 'founder' || user.role === 'salon_owner') && (
                    <Button 
                      onClick={() => window.location.href = user.role === 'founder' ? '/founder' : '/salon'}
                      className="bg-indigo-600 hover:bg-indigo-700"
                      data-testid="dashboard-btn"
                    >
                      {user.role === 'founder' ? 'Admin' : 'Mon Salon'}
                    </Button>
                  )}
                  <Button 
                    onClick={logout}
                    variant="outline"
                    className="border-slate-700 text-white hover:bg-slate-800"
                    data-testid="logout-btn"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  data-testid="login-btn"
                >
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1546641082-f149d4c3c907?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-8">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-indigo-300">TrimConnect Battle - Inscriptions ouvertes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-white mb-6 tracking-tight">
              La Reference de la
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">
                Coiffure Afro
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Reservez, simulez votre coupe avec l'IA, decouvrez les meilleurs produits 
              et participez au plus grand concours de coiffure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button 
                  onClick={() => window.location.href = user.role === 'founder' ? '/founder' : user.role === 'salon_owner' ? '/salon' : '/booking'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg shadow-indigo-500/25"
                  data-testid="go-dashboard-btn"
                >
                  {user.role === 'founder' ? 'Acceder au Dashboard Admin' : user.role === 'salon_owner' ? 'Acceder a Mon Salon' : 'Reserver maintenant'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/booking'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg shadow-indigo-500/25"
                  data-testid="get-started-btn"
                >
                  Reserver maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 py-6 px-8 rounded-xl text-lg"
                onClick={() => setIsVideoPlaying(true)}
                data-testid="watch-video-btn"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir la demo
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
                <div className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900">
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
              Une plateforme complete pour les clients et les professionnels de la coiffure afro.
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
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover-lift"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TrimConnect CTA Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-slate-800 rounded-2xl p-8 md:p-12 overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <span className="text-amber-500 font-heading font-bold text-xl">TrimConnect Barber Battle</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                  Le plus grand concours de coiffure afro
                </h2>
                <p className="text-slate-400 max-w-lg">
                  Montrez votre talent, gagnez des prix exceptionnels et rejoignez 
                  le Hall of Fame des meilleurs coiffeurs.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider py-4 px-8 rounded-xl"
                  style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
                  onClick={() => window.location.href = '/trimconnect'}
                  data-testid="join-battle-btn"
                >
                  Participer au concours
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
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

      {/* Salons Showcase */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Salons partenaires
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Decouvrez les meilleurs salons de coiffure afro pres de chez vous.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
                data-testid={`salon-card-${i}`}
              >
                <div className="h-48 bg-slate-700 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1549663369-22ac6b052faf?crop=entropy&cs=srgb&fm=jpg&q=85&w=400`}
                    alt="Salon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-white">Salon Excellence {i}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-white text-sm">4.9</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Paris, France</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-400 text-sm">5 coiffeurs</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-indigo-500" />
              <span className="text-lg font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">A propos</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">CGU</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Confidentialite</a>
            </div>
            <div className="text-slate-500 text-sm">
              2024 AfroCrown. Tous droits reserves.
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Connexion</DialogTitle>
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
              Continuer avec Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">ou</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="pl-10 bg-slate-900 border-slate-700 text-white"
                    data-testid="login-email-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="pl-10 bg-slate-900 border-slate-700 text-white"
                    data-testid="login-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="email-login-submit"
              >
                {loginLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Vous n'avez pas de compte ? Contactez l'administrateur.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Changer votre mot de passe</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-slate-400 text-sm mb-4 text-center">
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
