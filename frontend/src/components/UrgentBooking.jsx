import { useState } from "react";
import axios from "axios";
import { API } from "../App";
import { Zap, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const UrgentBooking = ({ onSelectSlot }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const findUrgentSlots = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bookings/urgent`, {
        params: { latitude: lat, longitude: lng, radius_km: 10 },
        withCredentials: true
      });
      setResults(response.data);
      if (response.data.count === 0) {
        toast.info("Aucun créneau disponible dans les 2h à proximité");
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        findUrgentSlots(latitude, longitude);
      },
      (error) => {
        toast.error("Impossible d'obtenir votre position");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleOpen = () => {
    setOpen(true);
    if (!userLocation) {
      handleLocate();
    } else {
      findUrgentSlots(userLocation.lat, userLocation.lng);
    }
  };

  const selectSlot = (salon, slot) => {
    if (onSelectSlot) {
      onSelectSlot({
        salonId: salon.salon_id,
        salonName: salon.name,
        barberId: slot.barber_id,
        barberName: slot.barber_name,
        time: slot.time,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpen(false);
    toast.success(`Créneau sélectionné : ${slot.time} chez ${salon.name}`);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25"
        data-testid="urgent-booking-btn"
      >
        <Zap className="h-4 w-4 mr-2" />
        Réservation urgente
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              Créneaux disponibles maintenant
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-slate-400 text-sm mb-4">
              Trouvez un créneau dans les 2 prochaines heures près de vous.
            </p>

            {(loading || locating) && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-slate-400 text-sm">
                  {locating ? "Localisation en cours..." : "Recherche de créneaux..."}
                </p>
              </div>
            )}

            {!loading && !locating && results && (
              <>
                {results.count === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Aucun créneau disponible</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Essayez de réserver normalement pour plus d'options
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-400 text-sm font-medium">
                      {results.count} salon(s) avec des créneaux disponibles
                    </p>

                    {results.salons.map((salon) => (
                      <div
                        key={salon.salon_id}
                        className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-700">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-semibold">{salon.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3 text-slate-500" />
                                <span className="text-slate-400 text-xs">
                                  {salon.address || salon.city}
                                </span>
                              </div>
                            </div>
                            {salon.rating > 0 && (
                              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded">
                                <Star className="h-3 w-3 text-amber-400" />
                                <span className="text-amber-400 text-xs font-medium">
                                  {salon.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 flex flex-wrap gap-2">
                          {salon.available_slots.map((slot, idx) => (
                            <button
                              key={idx}
                              onClick={() => selectSlot(salon, slot)}
                              className="flex items-center gap-2 bg-slate-800 hover:bg-indigo-600 border border-slate-600 hover:border-indigo-500 rounded-lg px-3 py-2 transition-all group"
                            >
                              <Clock className="h-4 w-4 text-slate-400 group-hover:text-white" />
                              <div className="text-left">
                                <p className="text-white font-medium text-sm">{slot.time}</p>
                                <p className="text-slate-400 group-hover:text-slate-300 text-xs">
                                  {slot.barber_name}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {!loading && !locating && !results && (
              <div className="text-center py-8">
                <Button
                  onClick={handleLocate}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Activer la localisation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UrgentBooking;
