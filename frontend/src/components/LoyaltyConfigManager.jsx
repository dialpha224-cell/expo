import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { 
  Gift, 
  Settings,
  Save,
  Scissors,
  ShoppingBag,
  Percent
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const LoyaltyConfigManager = ({ salonId }) => {
  const [config, setConfig] = useState({
    max_stamps: 10,
    reward_type: "free_haircut",
    reward_description: "Coupe gratuite"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [salonId]);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/loyalty-config`, { withCredentials: true });
      setConfig(response.data);
    } catch (error) {
      console.log("Error fetching config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/salons/${salonId}/loyalty-config`, config, { withCredentials: true });
      toast.success("Configuration sauvegardee !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const rewardTypes = [
    { value: "free_haircut", label: "Coupe gratuite", icon: Scissors },
    { value: "free_product", label: "Produit offert", icon: ShoppingBag },
    { value: "discount", label: "Reduction", icon: Percent }
  ];

  if (loading) {
    return <div className="text-slate-400 text-center py-8">Chargement...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuration Fidelite</h3>
          <p className="text-slate-400 text-sm">Parametrez votre programme de fidelite</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Number of stamps */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Nombre de tampons pour la recompense
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={3}
              max={20}
              value={config.max_stamps}
              onChange={(e) => setConfig({ ...config, max_stamps: parseInt(e.target.value) || 10 })}
              className="bg-slate-700 border-slate-600 text-white w-24"
              data-testid="max-stamps-input"
            />
            <span className="text-slate-400">coupes</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Le client recevra une recompense apres {config.max_stamps} visites
          </p>
        </div>

        {/* Reward Type */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">Type de recompense</label>
          <Select value={config.reward_type} onValueChange={(v) => setConfig({ ...config, reward_type: v })}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="reward-type-select">
              <SelectValue placeholder="Choisir le type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {rewardTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reward Description */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">Description de la recompense</label>
          <Input
            value={config.reward_description}
            onChange={(e) => setConfig({ ...config, reward_description: e.target.value })}
            placeholder="Ex: Coupe gratuite, Produit de soin offert..."
            className="bg-slate-700 border-slate-600 text-white"
            data-testid="reward-description-input"
          />
          <p className="text-slate-500 text-xs mt-1">
            Cette description sera affichee au client quand il gagne la recompense
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
          <h4 className="text-indigo-300 text-sm font-medium mb-3">Apercu de la carte</h4>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-medium">Carte Fidelite</span>
          </div>
          <div className="grid grid-cols-10 gap-1 mb-3">
            {Array.from({ length: config.max_stamps }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded ${i < 3 ? "bg-indigo-500" : "bg-slate-600"}`}
              />
            ))}
          </div>
          <p className="text-slate-400 text-xs">
            Apres {config.max_stamps} tampons : <span className="text-amber-400">{config.reward_description}</span>
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          data-testid="save-loyalty-config-btn"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LoyaltyConfigManager;
