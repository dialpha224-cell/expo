import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import { Store, ArrowLeft, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const LoginSalon = () => {
  const { user, login, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "salon_owner" || user.role === "founder") {
        navigate("/salon");
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isRegister) {
        // Register new salon owner
        const response = await axios.post(`${API}/auth/register`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: "salon_owner"
        });
        
        if (response.data.user) {
          setUser(response.data.user);
          toast.success("Compte créé avec succès !");
          navigate("/salon");
        }
      } else {
        // Login
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        }, { withCredentials: true });
        
        if (response.data.user) {
          setUser(response.data.user);
          if (response.data.user.role === "salon_owner" || response.data.user.role === "founder") {
            toast.success("Connexion réussie !");
            navigate("/salon");
          } else {
            toast.error("Ce compte n'est pas un compte propriétaire de salon");
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.detail || "Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          data-testid="back-to-home-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/30 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Espace <span className="text-amber-400">Salon</span>
            </h1>
            <p className="text-slate-400">
              {isRegister ? "Créez votre compte propriétaire" : "Gérez votre salon de coiffure"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-700/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isRegister ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"
              }`}
              data-testid="login-tab-btn"
            >
              Connexion
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isRegister ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"
              }`}
              data-testid="register-tab-btn"
            >
              Inscription
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Nom complet</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      placeholder="Votre nom"
                      required={isRegister}
                      data-testid="name-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="+33 6 12 34 56 78"
                    data-testid="phone-input"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="votre@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-11 pr-12 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-50 mt-6"
              data-testid="submit-salon-auth-btn"
            >
              {submitting ? "Chargement..." : (isRegister ? "Créer mon compte" : "Se connecter")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="px-4 text-slate-400 text-sm">ou</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSalon;
