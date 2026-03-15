import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Tag, 
  Plus, 
  Calendar, 
  Percent, 
  Trash2,
  Edit,
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

const PromotionsManager = ({ salonId, haircuts = [] }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    haircut_id: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: "",
    days_of_week: [],
    description: ""
  });

  const daysOfWeek = [
    { value: "monday", label: "Lundi" },
    { value: "tuesday", label: "Mardi" },
    { value: "wednesday", label: "Mercredi" },
    { value: "thursday", label: "Jeudi" },
    { value: "friday", label: "Vendredi" },
    { value: "saturday", label: "Samedi" },
    { value: "sunday", label: "Dimanche" }
  ];

  useEffect(() => {
    if (salonId) {
      fetchPromotions();
    }
  }, [salonId]);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/promotions?active_only=false`, {
        withCredentials: true
      });
      setPromotions(response.data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async () => {
    if (!newPromotion.name || !newPromotion.discount_value || !newPromotion.start_date || !newPromotion.end_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await axios.post(`${API}/salons/${salonId}/promotions`, {
        ...newPromotion,
        haircut_id: newPromotion.haircut_id || null,
        discount_value: parseFloat(newPromotion.discount_value)
      }, { withCredentials: true });
      
      toast.success("Promotion creee avec succes");
      setShowCreateDialog(false);
      setNewPromotion({
        name: "",
        haircut_id: "",
        discount_type: "percentage",
        discount_value: "",
        start_date: "",
        end_date: "",
        days_of_week: [],
        description: ""
      });
      fetchPromotions();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la creation");
    }
  };

  const togglePromotion = async (promotion) => {
    try {
      await axios.put(`${API}/salons/${salonId}/promotions/${promotion.promotion_id}`, {
        is_active: !promotion.is_active
      }, { withCredentials: true });
      toast.success(promotion.is_active ? "Promotion desactivee" : "Promotion activee");
      fetchPromotions();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const deletePromotion = async (promotionId) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    
    try {
      await axios.delete(`${API}/salons/${salonId}/promotions/${promotionId}`, {
        withCredentials: true
      });
      toast.success("Promotion supprimee");
      fetchPromotions();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const toggleDay = (day) => {
    setNewPromotion(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isPromotionActive = (promo) => {
    const today = new Date().toISOString().split('T')[0];
    return promo.is_active && promo.start_date <= today && promo.end_date >= today;
  };

  return (
    <div className="space-y-6" data-testid="promotions-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-white mb-1">Promotions</h2>
          <p className="text-slate-400 text-sm">Creez des offres speciales pour attirer plus de clients</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700" data-testid="add-promotion-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Creer une promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nom de la promotion *</label>
                <Input
                  placeholder="Ex: Happy Tuesday -20%"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Coupe concernee</label>
                <Select 
                  value={newPromotion.haircut_id || "all"} 
                  onValueChange={(v) => setNewPromotion({...newPromotion, haircut_id: v === "all" ? "" : v})}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Toutes les coupes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">Toutes les coupes</SelectItem>
                    {haircuts.map(h => (
                      <SelectItem key={h.haircut_id} value={h.haircut_id} className="text-white">
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Type de reduction</label>
                  <Select 
                    value={newPromotion.discount_type} 
                    onValueChange={(v) => setNewPromotion({...newPromotion, discount_type: v})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="percentage" className="text-white">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed" className="text-white">Montant fixe (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Valeur {newPromotion.discount_type === "percentage" ? "(%)" : "(EUR)"} *
                  </label>
                  <Input
                    type="number"
                    placeholder={newPromotion.discount_type === "percentage" ? "20" : "5"}
                    value={newPromotion.discount_value}
                    onChange={(e) => setNewPromotion({...newPromotion, discount_value: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Date de debut *</label>
                  <Input
                    type="date"
                    value={newPromotion.start_date}
                    onChange={(e) => setNewPromotion({...newPromotion, start_date: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Date de fin *</label>
                  <Input
                    type="date"
                    value={newPromotion.end_date}
                    onChange={(e) => setNewPromotion({...newPromotion, end_date: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Jours concernes (vide = tous les jours)</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        newPromotion.days_of_week.includes(day.value)
                          ? "bg-amber-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description (optionnel)</label>
                <Textarea
                  placeholder="Ex: Profitez de -20% sur toutes les coupes le mardi !"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  rows={2}
                />
              </div>
              
              <Button onClick={createPromotion} className="w-full bg-amber-600 hover:bg-amber-700">
                Creer la promotion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <Tag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune promotion active</p>
          <p className="text-slate-500 text-sm mt-1">Creez votre premiere offre pour attirer des clients</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div 
              key={promo.promotion_id}
              className={`bg-slate-800 border rounded-xl p-5 transition-all ${
                isPromotionActive(promo) ? "border-amber-500/50" : "border-slate-700 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{promo.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isPromotionActive(promo) 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-slate-600/20 text-slate-400"
                    }`}>
                      {isPromotionActive(promo) ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-amber-400" />
                      <span>
                        {promo.discount_type === "percentage" 
                          ? `-${promo.discount_value}%` 
                          : `-${promo.discount_value} EUR`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      <span>{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</span>
                    </div>
                    {promo.haircut_name && (
                      <span className="text-indigo-400">Sur: {promo.haircut_name}</span>
                    )}
                  </div>
                  
                  {promo.days_of_week?.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {promo.days_of_week.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          {daysOfWeek.find(d => d.value === day)?.label}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {promo.description && (
                    <p className="mt-2 text-sm text-slate-500">{promo.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePromotion(promo)}
                    className={promo.is_active ? "text-amber-400" : "text-green-400"}
                  >
                    {promo.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePromotion(promo.promotion_id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionsManager;
