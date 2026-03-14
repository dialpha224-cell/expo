import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
  Download,
  Home
} from "lucide-react";
import { Button } from "../components/ui/button";

const BookingConfirmation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`${API}/appointments/${appointmentId}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const appointment = data?.appointment;
  const salon = data?.salon;
  const barber = data?.barber;
  const haircut = data?.haircut;
  const qrCode = data?.qr_code;

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
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Reservation Confirmee !
          </h1>
          <p className="text-slate-400 mb-8">
            Votre rendez-vous a ete enregistre avec succes.
          </p>

          {/* Appointment Details */}
          {appointment && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-white font-medium mb-4">Details du rendez-vous</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="h-5 w-5 text-indigo-400" />
                  <span>{salon?.name || "Salon"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Scissors className="h-5 w-5 text-indigo-400" />
                  <span>{haircut?.name || "Coupe"} - {haircut?.price || 0} EUR</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="h-5 w-5 text-indigo-400" />
                  <span>{barber?.name || "Coiffeur"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <span>{appointment.appointment_date}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  <span>{appointment.appointment_time}</span>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-white font-medium mb-4">Votre QR Code</h2>
            <p className="text-slate-400 text-sm mb-6">
              Presentez ce code a votre arrivee au salon
            </p>
            
            <div className="bg-white p-4 rounded-xl inline-block mb-6">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              ) : (
                <QRCodeSVG 
                  value={`AFROCROWN|${appointmentId}`}
                  size={192}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>

            <div className="text-slate-500 text-sm font-mono">
              Ref: {appointmentId}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-medium mb-4">Informations importantes</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Presentez-vous 5 minutes avant l'heure prevue
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Montrez votre QR code au coiffeur a votre arrivee
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Le paiement s'effectue apres la prestation
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="go-home-btn"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour a l'accueil
            </Button>
            <Button
              onClick={() => navigate("/booking")}
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800"
              data-testid="new-booking-btn"
            >
              Nouvelle reservation
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
