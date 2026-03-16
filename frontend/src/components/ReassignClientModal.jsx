import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Users, 
  ArrowRight,
  User,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const ReassignClientModal = ({ appointment, isOpen, onClose, onReassigned }) => {
  const [colleagues, setColleagues] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    if (isOpen && appointment?.barber_id) {
      fetchColleagues();
    }
  }, [isOpen, appointment]);

  const fetchColleagues = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/barbers/${appointment.barber_id}/available-colleagues`,
        { withCredentials: true }
      );
      setColleagues(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des coiffeurs");
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedBarber) {
      toast.error("Selectionnez un coiffeur");
      return;
    }

    setReassigning(true);
    try {
      const response = await axios.post(
        `${API}/appointments/${appointment.appointment_id}/reassign`,
        {
          new_barber_id: selectedBarber.barber_id,
          reason: reason || null
        },
        { withCredentials: true }
      );

      toast.success(`Client reassigne a ${response.data.new_barber}`);
      
      if (onReassigned) {
        onReassigned(response.data);
      }
      
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la reassignation");
    } finally {
      setReassigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Reassigner le client
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Assignment */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">Client a reassigner</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{appointment?.client_name}</p>
                <p className="text-slate-400 text-sm">{appointment?.haircut_name}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">{appointment?.date}</p>
                <p className="text-white">{appointment?.time}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-600">
              <p className="text-slate-400 text-sm">Coiffeur actuel</p>
              <p className="text-orange-400 font-medium">{appointment?.barber_name}</p>
            </div>
          </div>

          {/* Available Colleagues */}
          <div>
            <p className="text-slate-300 text-sm mb-3">Coiffeurs disponibles</p>
            
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-2" />
                Chargement...
              </div>
            ) : colleagues.length === 0 ? (
              <div className="text-center py-8 bg-slate-700/30 rounded-xl">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">Aucun coiffeur disponible</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {colleagues.map((barber) => (
                  <motion.button
                    key={barber.barber_id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedBarber(barber)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      selectedBarber?.barber_id === barber.barber_id
                        ? "bg-indigo-600/20 border-indigo-500"
                        : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                    }`}
                    data-testid={`select-barber-${barber.barber_id}`}
                  >
                    {barber.profile_photo_url ? (
                      <img 
                        src={barber.profile_photo_url}
                        alt={barber.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{barber.name}</p>
                      <p className="text-slate-400 text-sm">{barber.role || "Coiffeur"}</p>
                    </div>
                    {selectedBarber?.barber_id === barber.barber_id && (
                      <Check className="w-5 h-5 text-indigo-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Raison (optionnel)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Coiffeur en pause, urgence familiale..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
          </div>

          {/* Reassign Flow Visual */}
          {selectedBarber && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-center gap-4"
            >
              <div className="text-center">
                <p className="text-orange-400 font-medium">{appointment?.barber_name}</p>
                <p className="text-slate-500 text-xs">Actuel</p>
              </div>
              <ArrowRight className="w-6 h-6 text-indigo-400" />
              <div className="text-center">
                <p className="text-green-400 font-medium">{selectedBarber.name}</p>
                <p className="text-slate-500 text-xs">Nouveau</p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleReassign}
              disabled={!selectedBarber || reassigning}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              data-testid="confirm-reassign-btn"
            >
              {reassigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Reassignation...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Reassigner
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignClientModal;
