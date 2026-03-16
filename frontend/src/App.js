import { useEffect, useState, useRef, createContext, useContext, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { LanguageProvider } from "./context/LanguageContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthCallback from "./pages/AuthCallback";
import FounderDashboard from "./pages/FounderDashboard";
import SalonDashboard from "./pages/SalonDashboard";
import Marketplace from "./pages/Marketplace";
import TrimConnect from "./pages/TrimConnect";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import AISimulation from "./pages/AISimulation";
import MyAppointments from "./pages/MyAppointments";
import SetupPassword from "./pages/SetupPassword";
import SalonLiveScreen from "./pages/SalonLiveScreen";
import LoginAdmin from "./pages/LoginAdmin";
import LoginSalon from "./pages/LoginSalon";
import LoginClient from "./pages/LoginClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async (force = false) => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    
    // Skip if already checked and not forced
    if (authChecked && !force) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      console.log("Auth check response:", response.data);
      setUser(response.data);
      setAuthChecked(true);
    } catch (error) {
      console.log("Auth check failed, user not logged in");
      setUser(null);
      setAuthChecked(true);
    } finally {
      setLoading(false);
    }
  }, [authChecked]);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setAuthChecked(false);
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Force refresh user when setUser is called with new data
  const updateUser = useCallback((userData) => {
    console.log("Updating user state:", userData);
    setUser(userData);
    setAuthChecked(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === "founder") {
      return <Navigate to="/founder" replace />;
    } else if (user.role === "salon_owner") {
      return <Navigate to="/salon" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router Component
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id SYNCHRONOUSLY during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Login Pages - Specific URLs for each user type */}
      <Route path="/login/admin" element={<LoginAdmin />} />
      <Route path="/login/salon" element={<LoginSalon />} />
      <Route path="/login/client" element={<LoginClient />} />
      <Route
        path="/founder/*"
        element={
          <ProtectedRoute requiredRoles={["founder"]}>
            <FounderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/salon/*"
        element={
          <ProtectedRoute requiredRoles={["salon_owner", "founder"]}>
            <SalonDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/trimconnect" element={<TrimConnect />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/booking/confirmation/:appointmentId" element={<BookingConfirmation />} />
      <Route path="/ai-simulation" element={<AISimulation />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/setup-password" element={<SetupPassword />} />
      <Route path="/salon/screen/:salonId" element={<SalonLiveScreen />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
    </Routes>
  );
}

// Payment Success Page
const PaymentSuccess = () => {
  const [status, setStatus] = useState("checking");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, [location]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      if (response.data.payment_status === "paid") {
        setStatus("success");
        toast.success("Paiement reussi !");
      } else if (response.data.status === "expired") {
        setStatus("expired");
      } else {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-8 text-center max-w-md">
        {status === "checking" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-white">Verification du paiement...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Paiement reussi !</h2>
            <p className="text-slate-400 mb-4">Merci pour votre achat.</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Retour a l'accueil
            </button>
          </>
        )}
        {(status === "error" || status === "timeout" || status === "expired") && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erreur de paiement</h2>
            <p className="text-slate-400 mb-4">Une erreur est survenue.</p>
            <button onClick={() => navigate("/")} className="btn-secondary">
              Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Payment Cancel Page
const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Paiement annule</h2>
        <p className="text-slate-400 mb-4">Votre paiement a ete annule.</p>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Retour a l'accueil
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
