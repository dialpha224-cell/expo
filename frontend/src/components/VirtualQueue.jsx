import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { 
  Users, 
  Clock, 
  UserPlus, 
  LogOut,
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const VirtualQueue = ({ salonId, salonName, isOwner = false }) => {
  const [queue, setQueue] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [selectedService, setSelectedService] = useState("Coupe standard");

  const services = [
    "Coupe simple",
    "Coupe standard",
    "Coupe + Barbe",
    "Tresses",
    "Locks",
    "Coloration"
  ];

  const fetchQueue = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/queue/${salonId}`);
      setQueue(response.data);
    } catch (error) {
      console.log("Error fetching queue:", error);
    }
  }, [salonId]);

  const fetchMyPosition = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/queue/my-position/${salonId}`, { withCredentials: true });
      setMyPosition(response.data);
    } catch (error) {
      setMyPosition(null);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchQueue();
    fetchMyPosition();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueue();
      fetchMyPosition();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchQueue, fetchMyPosition]);

  const handleJoinQueue = async () => {
    setJoining(true);
    try {
      const response = await axios.post(
        `${API}/queue/${salonId}/join?service_type=${encodeURIComponent(selectedService)}`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setMyPosition({
        in_queue: true,
        status: "waiting",
        position: response.data.position,
        estimated_wait_minutes: response.data.estimated_wait_minutes
      });
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await axios.post(`${API}/queue/${salonId}/leave`, {}, { withCredentials: true });
      toast.success("Vous avez quitté la file");
      setMyPosition(null);
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const handleCallNext = async () => {
    try {
      const response = await axios.post(
        `${API}/queue/${salonId}/call-next`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message);
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-24 bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="virtual-queue">
      {/* Queue Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">File d'attente virtuelle</h3>
                <p className="text-slate-400 text-sm">{salonName || "Salon"}</p>
              </div>
            </div>
            <Button
              onClick={() => { fetchQueue(); fetchMyPosition(); }}
              variant="ghost"
              size="sm"
              className="text-slate-400"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-700">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{queue?.queue_length || 0}</p>
            <p className="text-slate-500 text-xs">En attente</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{queue?.in_progress || 0}</p>
            <p className="text-slate-500 text-xs">En cours</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {queue?.total_wait_minutes ? formatWaitTime(queue.total_wait_minutes) : "0 min"}
            </p>
            <p className="text-slate-500 text-xs">Attente totale</p>
          </div>
        </div>
      </div>

      {/* My Position */}
      {myPosition?.in_queue && (
        <div className={`rounded-xl p-4 border ${
          myPosition.status === "in_progress"
            ? "bg-green-600/20 border-green-500/50"
            : "bg-amber-600/20 border-amber-500/50"
        }`}>
          {myPosition.status === "in_progress" ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/30 rounded-full animate-pulse">
                <Play className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-green-300 font-bold text-lg">C'est votre tour !</p>
                <p className="text-green-400/80 text-sm">Présentez-vous au comptoir</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                  <span className="text-amber-300 font-bold text-xl">#{myPosition.position}</span>
                </div>
                <div>
                  <p className="text-white font-medium">Votre position dans la file</p>
                  <p className="text-amber-300 text-sm">
                    Attente estimée: ~{formatWaitTime(myPosition.estimated_wait_minutes)}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLeaveQueue}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Quitter
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Join Queue (if not in queue) */}
      {!myPosition?.in_queue && !isOwner && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-white font-medium mb-3">Rejoindre la file d'attente</p>
          <div className="flex gap-3">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="flex-1 bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="Type de service" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {services.map((service) => (
                  <SelectItem key={service} value={service} className="text-white hover:bg-slate-700">
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleJoinQueue}
              disabled={joining}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {joining ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Rejoindre
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Owner Controls */}
      {isOwner && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-medium">Gestion de la file</p>
            <Button
              onClick={handleCallNext}
              disabled={!queue?.queue_length}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Appeler suivant
            </Button>
          </div>
          
          {/* Queue List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queue?.queue?.length > 0 ? (
              queue.queue.map((entry, idx) => (
                <div
                  key={entry.queue_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.status === "in_progress" 
                      ? "bg-green-600/20 border border-green-500/30"
                      : "bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.status === "in_progress"
                        ? "bg-green-500 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {entry.status === "in_progress" ? <Play className="h-4 w-4" /> : entry.position}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{entry.client_name}</p>
                      <p className="text-slate-500 text-xs">{entry.service_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">~{entry.estimated_duration} min</p>
                    {entry.status === "waiting" && (
                      <p className="text-indigo-400 text-xs">
                        Attente: ~{formatWaitTime(entry.estimated_wait_minutes || 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500">File d'attente vide</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualQueue;
