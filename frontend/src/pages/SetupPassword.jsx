import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Scissors, Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("verifying"); // verifying, valid, invalid, success
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus("invalid");
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/verify-setup-token/${token}`);
      setUserData(response.data);
      setStatus("valid");
    } catch (error) {
      setStatus("invalid");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/setup-password`, {
        token,
        password
      }, { withCredentials: true });
      
      setUser(response.data);
      setStatus("success");
      toast.success("Compte active avec succes !");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (response.data.role === "founder") {
          navigate("/founder");
        } else if (response.data.role === "salon_owner") {
          navigate("/salon");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la creation du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Scissors className="h-10 w-10 text-indigo-500" />
            <span className="text-2xl font-heading font-bold text-white">AfroCrown</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          {status === "verifying" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-white">Verification du lien...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold text-white mb-2">Lien invalide</h2>
              <p className="text-slate-400 mb-6">
                Ce lien est invalide ou a expire. Contactez l'administrateur pour obtenir un nouveau lien.
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="border-slate-700 text-white">
                Retour a l'accueil
              </Button>
            </div>
          )}

          {status === "valid" && userData && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-heading font-bold text-white mb-2">
                  Bienvenue {userData.name} !
                </h2>
                <p className="text-slate-400">
                  Creez votre mot de passe pour activer votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={userData.email}
                    disabled
                    className="bg-slate-900 border-slate-700 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Minimum 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white"
                      data-testid="new-password-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Repetez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white"
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-3"
                  data-testid="setup-password-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activation...
                    </>
                  ) : (
                    "Activer mon compte"
                  )}
                </Button>
              </form>
            </>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold text-white mb-2">Compte active !</h2>
              <p className="text-slate-400 mb-4">
                Votre compte a ete active avec succes. Vous allez etre redirige...
              </p>
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPassword;
