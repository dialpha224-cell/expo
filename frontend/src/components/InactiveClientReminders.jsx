import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { UserMinus, Mail, AlertCircle, Check, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const InactiveClientReminders = ({ salonId }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);

  useEffect(() => {
    fetchInactiveClients();
  }, []);

  const fetchInactiveClients = async () => {
    try {
      const response = await axios.get(`${API}/client/inactive-reminder`, { withCredentials: true });
      setClients(response.data.clients || []);
    } catch (error) {
      console.log("Error fetching inactive clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (clientId, clientName) => {
    setSendingTo(clientId);
    try {
      await axios.post(
        `${API}/client/${clientId}/send-reminder`,
        null,
        { 
          params: { message_type: "comeback" },
          withCredentials: true 
        }
      );
      toast.success(`Rappel envoyé à ${clientName}`);
      // Remove from list
      setClients(clients.filter(c => c._id !== clientId));
    } catch (error) {
      const message = error.response?.data?.detail || "Erreur lors de l'envoi";
      toast.error(message);
    } finally {
      setSendingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-24 bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden" data-testid="inactive-clients">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-amber-400" />
          <h3 className="font-semibold text-white">Clients à relancer</h3>
          {clients.length > 0 && (
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              {clients.length}
            </span>
          )}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="p-8 text-center">
          <Check className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="text-slate-400">Tous vos clients sont actifs !</p>
          <p className="text-slate-500 text-sm mt-1">Aucun client inactif depuis 4 semaines</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-700">
          {clients.slice(0, 10).map((client) => (
            <div 
              key={client._id} 
              className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {client.client_name || "Client anonyme"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500 text-xs truncate">
                    {client.client_email}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock className="h-3 w-3" />
                    Dernier RDV: {client.last_visit}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {client.total_visits} visite(s) au total
                </p>
              </div>
              <Button
                onClick={() => sendReminder(client._id, client.client_name)}
                disabled={sendingTo === client._id}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 ml-4"
              >
                {sendingTo === client._id ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                    Envoi...
                  </span>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    Relancer
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {clients.length > 0 && (
        <div className="p-4 bg-slate-900/30 border-t border-slate-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-slate-500 text-xs">
              Les rappels sont limités à 1 par semaine par client, et respectent leurs préférences de notification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InactiveClientReminders;
