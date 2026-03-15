import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        console.error("No session_id found in URL");
        setStatus("error");
        setTimeout(() => navigate("/", { replace: true }), 1000);
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        // Exchange session_id for session token
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const userData = response.data;
        console.log("AuthCallback - User data received:", userData);
        
        // Update user in context
        setUser(userData);
        setStatus("success");
        
        // Small delay to ensure state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clear the hash from URL before navigating
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect based on user role
        if (userData.role === "founder") {
          console.log("Redirecting founder to /founder");
          window.location.href = "/founder";
        } else if (userData.role === "salon_owner") {
          console.log("Redirecting salon_owner to /salon");
          window.location.href = "/salon";
        } else {
          console.log("Redirecting client to /");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Auth error:", error);
        setStatus("error");
        setTimeout(() => navigate("/", { replace: true }), 1000);
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">
          {status === "processing" && "Connexion en cours..."}
          {status === "success" && "Connexion reussie! Redirection..."}
          {status === "error" && "Erreur de connexion. Redirection..."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
