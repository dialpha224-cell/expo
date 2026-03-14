import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { 
  Scissors, 
  ArrowLeft, 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

const MyAppointments = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments`, { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/20", label: "En attente" };
      case "confirmed":
        return { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/20", label: "Confirme" };
      case "completed":
        return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20", label: "Termine" };
      case "cancelled":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/20", label: "Annule" };
      default:
        return { icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-500/20", label: status };
    }
  };

  const showQR = async (appointment) => {
    try {
      const response = await axios.get(`${API}/appointments/${appointment.appointment_id}`);
      setSelectedAppointment(response.data);
      setShowQRDialog(true);
    } catch (error) {
      console.error("Error fetching QR:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-indigo-500" />
                <span className="font-heading font-bold text-white">AfroCrown</span>
              </a>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-6" />
          <h1 className="text-2xl font-heading font-bold text-white mb-4">Connectez-vous</h1>
          <p className="text-slate-400 mb-8">Pour voir vos rendez-vous, veuillez vous connecter.</p>
          <Button onClick={login} className="bg-indigo-600 hover:bg-indigo-700">
            Se connecter
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-indigo-500" />
              <span className="font-heading font-bold text-white">AfroCrown</span>
            </a>
            <span className="text-slate-400">Mes Rendez-vous</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </a>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Mes Rendez-vous</h1>
            <p className="text-slate-400">{appointments.length} rendez-vous</p>
          </div>
          <Button 
            onClick={() => navigate("/booking")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Nouveau rendez-vous
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun rendez-vous</h3>
            <p className="text-slate-400 mb-6">Vous n'avez pas encore de rendez-vous.</p>
            <Button 
              onClick={() => navigate("/booking")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Reserver maintenant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={appointment.appointment_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <span className="font-medium">{appointment.appointment_date}</span>
                        <Clock className="h-4 w-4 text-indigo-400 ml-2" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      
                      <div className="text-slate-400 text-sm">
                        Prix: <span className="text-indigo-400 font-medium">{appointment.total_price} EUR</span>
                      </div>
                    </div>
                    
                    {(appointment.status === "pending" || appointment.status === "confirmed") && (
                      <Button
                        onClick={() => showQR(appointment)}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Votre QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <p className="text-slate-400 text-sm mb-6 text-center">
              Presentez ce code a votre arrivee au salon
            </p>
            <div className="bg-white p-4 rounded-xl">
              {selectedAppointment?.qr_code ? (
                <img src={selectedAppointment.qr_code} alt="QR Code" className="w-48 h-48" />
              ) : (
                <QRCodeSVG 
                  value={`AFROCROWN|${selectedAppointment?.appointment?.appointment_id}`}
                  size={192}
                  level="H"
                />
              )}
            </div>
            <p className="text-slate-500 text-xs mt-4 font-mono">
              Ref: {selectedAppointment?.appointment?.appointment_id}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointments;
