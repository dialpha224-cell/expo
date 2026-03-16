import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Camera, 
  Plus, 
  Heart,
  Trash2,
  Image,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const MonthlyCutsManager = ({ salonId }) => {
  const [cuts, setCuts] = useState([]);
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    haircut_id: ""
  });

  useEffect(() => {
    fetchCuts();
    fetchHaircuts();
  }, [salonId]);

  const fetchCuts = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/monthly-cuts`, { withCredentials: true });
      setCuts(response.data);
    } catch (error) {
      console.log("Error fetching cuts");
    } finally {
      setLoading(false);
    }
  };

  const fetchHaircuts = async () => {
    try {
      const response = await axios.get(`${API}/salons/${salonId}/haircuts`, { withCredentials: true });
      setHaircuts(response.data);
    } catch (error) {
      console.log("Error fetching haircuts");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez selectionner une image");
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(`${API}/upload/image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setFormData({ ...formData, image_url: response.data.url });
      toast.success("Image uploadee !");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error("Titre et image requis");
      return;
    }

    try {
      const response = await axios.post(`${API}/salons/${salonId}/monthly-cuts`, formData, { withCredentials: true });
      setCuts([response.data, ...cuts]);
      setShowAddDialog(false);
      setFormData({ title: "", description: "", image_url: "", haircut_id: "" });
      toast.success("Coupe du mois ajoutee !");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const handleDelete = async (cutId) => {
    if (!window.confirm("Supprimer cette coupe ?")) return;

    try {
      await axios.delete(`${API}/monthly-cuts/${cutId}`, { withCredentials: true });
      setCuts(cuts.filter(c => c.cut_id !== cutId));
      toast.success("Coupe supprimee");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Coupes du Mois
          </h3>
          <p className="text-slate-400 text-sm">
            Mettez en avant vos plus belles realisations sur la page d'accueil.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900"
          data-testid="add-monthly-cut-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Cuts Grid */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Chargement...</div>
      ) : cuts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
          <Image className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Aucune coupe du mois pour l'instant</p>
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premiere coupe
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuts.map((cut) => (
            <motion.div
              key={cut.cut_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group"
            >
              <div className="aspect-video relative">
                <img 
                  src={cut.image_url}
                  alt={cut.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(cut.cut_id)}
                    className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg"
                    data-testid={`delete-cut-${cut.cut_id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-slate-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400" />
                    {cut.likes || 0}
                  </div>
                  <div className="bg-indigo-600/80 text-white text-xs px-2 py-1 rounded-full">
                    {cut.month}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-white truncate">{cut.title}</h4>
                {cut.haircut_name && (
                  <p className="text-slate-400 text-sm">{cut.haircut_name}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Ajouter une Coupe du Mois</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Photo *</label>
              {formData.image_url ? (
                <div className="relative">
                  <img 
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 bg-slate-700 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <Camera className="w-10 h-10 text-slate-500 mb-2" />
                  <span className="text-slate-400 text-sm">
                    {uploading ? "Upload en cours..." : "Cliquez pour uploader"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Fade parfait avec design"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="cut-title-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Decrivez cette realisation..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            {/* Haircut Select */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Type de coupe (optionnel)</label>
              <Select value={formData.haircut_id} onValueChange={(v) => setFormData({ ...formData, haircut_id: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selectionner une coupe" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {haircuts.map((hc) => (
                    <SelectItem key={hc.haircut_id} value={hc.haircut_id} className="text-white hover:bg-slate-600">
                      {hc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.image_url}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
              data-testid="submit-monthly-cut-btn"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Publier la coupe du mois
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyCutsManager;
