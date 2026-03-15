import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Calendar,
  Sparkles,
  Monitor
} from "lucide-react";
import { Button } from "../components/ui/button";

const SalonLiveScreen = () => {
  const { salonId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSimulation, setShowSimulation] = useState(false);

  const fetchLiveData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/live-screen`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les donnees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  // Fetch data on mount and every 30 seconds
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (displayStatus) => {
    switch (displayStatus) {
      case "on_time":
      case "early":
        return "border-green-500 bg-green-500/10";
      case "late":
        return "border-red-500 bg-red-500/10";
      case "cancelled":
        return "border-slate-600 bg-slate-800/50 opacity-50";
      case "completed":
        return "border-slate-600 bg-slate-700/30";
      default:
        return "border-slate-700";
    }
  };

  const getStatusBadge = (appointment) => {
    if (appointment.display_status === "cancelled") {
      return (
        <span className="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-sm line-through">
          Annule
        </span>
      );
    }
    if (appointment.display_status === "late") {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          Retard {appointment.arrival_minutes} min
        </span>
      );
    }
    if (appointment.display_status === "early") {
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Avance {appointment.arrival_minutes} min
        </span>
      );
    }
    if (appointment.display_status === "completed") {
      return (
        <span className="px-3 py-1 bg-slate-600/20 text-slate-400 rounded-full text-sm">
          Termine
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
        <CheckCircle className="h-4 w-4" />
        A l'heure
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error}</p>
          <Button onClick={fetchLiveData} className="bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">
                  {data?.salon?.name}
                </h1>
                <p className="text-slate-400 text-sm">{data?.salon?.address}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Current Time */}
              <div className="text-right">
                <p className="text-4xl font-bold text-white font-mono">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-slate-400">
                  {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              
              {/* Toggle Simulation */}
              <Button
                onClick={() => setShowSimulation(!showSimulation)}
                variant={showSimulation ? "default" : "outline"}
                className={showSimulation ? "bg-indigo-600" : "border-slate-700 text-slate-300"}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Simulation IA
              </Button>
              
              {/* Refresh */}
              <Button
                onClick={fetchLiveData}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{data?.stats?.total || 0}</p>
            <p className="text-slate-400 text-sm">Total RDV</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{data?.stats?.on_time || 0}</p>
            <p className="text-green-400/70 text-sm">A l'heure</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{data?.stats?.late || 0}</p>
            <p className="text-red-400/70 text-sm">En retard</p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-400">{data?.stats?.cancelled || 0}</p>
            <p className="text-slate-500 text-sm">Annules</p>
          </div>
        </div>

        {showSimulation ? (
          /* AI Simulation Mode */
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Simulation de Coupe IA
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Scannez le QR code avec votre smartphone ou utilisez l'ecran tactile pour simuler votre prochaine coupe.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6">
                <Monitor className="h-5 w-5 mr-2" />
                Utiliser l'ecran
              </Button>
            </div>
          </div>
        ) : (
          /* Appointments List */
          <div className="space-y-4">
            <AnimatePresence>
              {data?.appointments?.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                  <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-xl text-slate-400">Aucun rendez-vous aujourd'hui</p>
                </div>
              ) : (
                data?.appointments?.map((appointment, index) => (
                  <motion.div
                    key={appointment.appointment_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-2 rounded-xl p-6 transition-all ${getStatusStyle(appointment.display_status)} ${
                      appointment.display_status === "cancelled" ? "line-through" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Time */}
                        <div className="text-center min-w-[80px]">
                          <p className={`text-3xl font-bold font-mono ${
                            appointment.display_status === "cancelled" ? "text-slate-500" : "text-white"
                          }`}>
                            {appointment.time}
                          </p>
                          <p className="text-slate-500 text-sm">{appointment.duration} min</p>
                        </div>
                        
                        {/* Divider */}
                        <div className={`w-1 h-16 rounded-full ${
                          appointment.display_status === "late" ? "bg-red-500" :
                          appointment.display_status === "cancelled" ? "bg-slate-600" :
                          "bg-green-500"
                        }`}></div>
                        
                        {/* Client Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className={`h-5 w-5 ${
                              appointment.display_status === "cancelled" ? "text-slate-500" : "text-indigo-400"
                            }`} />
                            <p className={`text-xl font-semibold ${
                              appointment.display_status === "cancelled" ? "text-slate-500" : "text-white"
                            }`}>
                              {appointment.client_name}
                            </p>
                          </div>
                          <p className={`${
                            appointment.display_status === "cancelled" ? "text-slate-600" : "text-slate-400"
                          }`}>
                            {appointment.haircut_name} • {appointment.barber_name}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {getStatusBadge(appointment)}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Available Barbers */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Coiffeurs disponibles</h3>
          <div className="flex flex-wrap gap-3">
            {data?.barbers?.map((barber) => (
              <div
                key={barber.barber_id}
                className={`px-4 py-2 rounded-full border ${
                  barber.is_available 
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${
                  barber.is_available ? "bg-green-500" : "bg-red-500"
                }`}></span>
                {barber.name}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Scissors className="h-4 w-4" />
            <span>AfroCrown Live Display</span>
          </div>
          <p className="text-slate-500 text-sm">
            Mise a jour automatique toutes les 30 secondes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalonLiveScreen;
