import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Coffee, 
  Cookie,
  Plus, 
  Trash2,
  Edit,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import PhotoUploader from "./PhotoUploader";

const PremiumServicesManager = ({ salonId }) => {
  const [services, setServices] = useState({ drinks: [], snacks: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    category: "drink",
    image_url: ""
  });

  useEffect(() => {
    if (salonId) {
      fetchServices();
    }
  }, [salonId]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/premium-services`, {
        withCredentials: true
      });
      setServices({
        drinks: response.data.drinks || [],
        snacks: response.data.snacks || []
      });
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async () => {
    if (!newService.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      await axios.post(`${API}/salons/${salonId}/premium-services`, newService, {
        withCredentials: true
      });
      toast.success("Service ajoute avec succes");
      setShowCreateDialog(false);
      setNewService({ name: "", description: "", category: "drink", image_url: "" });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout");
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm("Supprimer ce service ?")) return;
    
    try {
      await axios.delete(`${API}/salons/${salonId}/premium-services/${serviceId}`, {
        withCredentials: true
      });
      toast.success("Service supprime");
      fetchServices();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const ServiceCard = ({ service }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
      <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
        {service.image_url ? (
          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {service.category === "drink" ? (
              <Coffee className="h-8 w-8 text-slate-500" />
            ) : (
              <Cookie className="h-8 w-8 text-slate-500" />
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{service.name}</h4>
        {service.description && (
          <p className="text-sm text-slate-400 truncate">{service.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteService(service.service_id)}
        className="text-red-400 hover:text-red-300 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const hasPremium = services.drinks.length > 0 || services.snacks.length > 0;

  return (
    <div className="space-y-6" data-testid="premium-services-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Services Premium
          </h2>
          <p className="text-slate-400 text-sm">
            Boissons et snacks offerts pour les reservations premium (+20%)
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700" data-testid="add-service-btn">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter un service premium</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Type</label>
                <Select 
                  value={newService.category} 
                  onValueChange={(v) => setNewService({...newService, category: v})}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="drink" className="text-white">
                      <span className="flex items-center gap-2">
                        <Coffee className="h-4 w-4" /> Boisson
                      </span>
                    </SelectItem>
                    <SelectItem value="snack" className="text-white">
                      <span className="flex items-center gap-2">
                        <Cookie className="h-4 w-4" /> Snack
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom *</label>
                <Input
                  placeholder={newService.category === "drink" ? "Ex: Cafe, The, Jus d'orange" : "Ex: Biscuits, Fruits secs"}
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description (optionnel)</label>
                <Textarea
                  placeholder="Ex: Cafe fraichement moulu, servi chaud"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  rows={2}
                />
              </div>
              
              <Button onClick={createService} className="w-full bg-amber-600 hover:bg-amber-700">
                Ajouter le service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-white font-medium">Reservations Premium</p>
            <p className="text-slate-400 text-sm">
              Les clients peuvent choisir une reservation premium (+20%) et beneficier de vos boissons et snacks.
              <span className="text-amber-400 font-medium"> Ajoutez vos offres pour activer cette option.</span>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : !hasPremium ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Coffee className="h-10 w-10 text-slate-600" />
            <Cookie className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-slate-400">Aucun service premium configure</p>
          <p className="text-slate-500 text-sm mt-1">
            Ajoutez des boissons et snacks pour activer les reservations premium
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Drinks */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-400" />
              Boissons ({services.drinks.length})
            </h3>
            <div className="space-y-3">
              {services.drinks.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucune boisson ajoutee</p>
              ) : (
                services.drinks.map((drink) => (
                  <ServiceCard key={drink.service_id} service={drink} />
                ))
              )}
            </div>
          </div>
          
          {/* Snacks */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-amber-400" />
              Snacks ({services.snacks.length})
            </h3>
            <div className="space-y-3">
              {services.snacks.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucun snack ajoute</p>
              ) : (
                services.snacks.map((snack) => (
                  <ServiceCard key={snack.service_id} service={snack} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {hasPremium && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-green-400">
            Les reservations premium sont activees pour votre salon !
          </p>
        </div>
      )}
    </div>
  );
};

export default PremiumServicesManager;
