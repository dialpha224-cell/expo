import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { 
  Shield, 
  Download, 
  Trash2, 
  AlertTriangle,
  Check,
  X,
  FileText,
  Lock,
  Bell,
  Share2,
  BarChart3
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";

const PrivacySettings = () => {
  const [consents, setConsents] = useState({
    marketing_emails: false,
    data_analytics: false,
    photo_sharing: false,
    third_party_sharing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const response = await axios.get(`${API}/rgpd/consent-status`, {
        withCredentials: true
      });
      setConsents(response.data.consents);
    } catch (error) {
      console.log("Error fetching consents:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (key, value) => {
    const newConsents = { ...consents, [key]: value };
    setConsents(newConsents);
    setSaving(true);

    try {
      await axios.put(`${API}/rgpd/update-consent`, newConsents, {
        withCredentials: true
      });
      toast.success("Préférences mises à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      setConsents(consents); // Revert
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get(`${API}/rgpd/my-data`, {
        withCredentials: true
      });
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mes_donnees_afrocrown_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Données exportées avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER pour confirmer");
      return;
    }

    try {
      await axios.delete(`${API}/rgpd/delete-my-account`, {
        withCredentials: true
      });
      toast.success("Compte supprimé");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const consentOptions = [
    {
      key: "marketing_emails",
      icon: Bell,
      title: "Emails marketing",
      description: "Recevoir des offres promotionnelles et actualités"
    },
    {
      key: "data_analytics",
      icon: BarChart3,
      title: "Analytics",
      description: "Nous aider à améliorer nos services via l'analyse d'usage"
    },
    {
      key: "photo_sharing",
      icon: Share2,
      title: "Partage de photos",
      description: "Autoriser le partage de vos photos de coupe dans la galerie"
    },
    {
      key: "third_party_sharing",
      icon: Share2,
      title: "Partage tiers",
      description: "Partager certaines données avec nos partenaires"
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="privacy-settings">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Shield className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Confidentialité & RGPD</h3>
          <p className="text-slate-400 text-sm">Gérez vos données et préférences</p>
        </div>
      </div>

      {/* Consent Management */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-400" />
          Préférences de consentement
        </h4>
        
        <div className="space-y-4">
          {consentOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
            >
              <div className="flex items-start gap-3">
                <option.icon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">{option.title}</p>
                  <p className="text-slate-400 text-xs">{option.description}</p>
                </div>
              </div>
              <Switch
                checked={consents[option.key]}
                onCheckedChange={(checked) => updateConsent(option.key, checked)}
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Data Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Vos droits RGPD
        </h4>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Export Data */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <h5 className="text-white font-medium text-sm">Exporter mes données</h5>
                <p className="text-slate-400 text-xs mb-3">
                  Téléchargez toutes vos données (Article 20 RGPD)
                </p>
                <Button
                  onClick={exportData}
                  size="sm"
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <h5 className="text-white font-medium text-sm">Supprimer mon compte</h5>
                <p className="text-slate-400 text-xs mb-3">
                  Suppression définitive de toutes vos données (Article 17 RGPD)
                </p>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Documents */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h4 className="text-white font-medium mb-4">Documents légaux</h4>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/guides/download/Politique_Confidentialite_AfroCrown.pdf"
            target="_blank"
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Politique de confidentialité
          </a>
          <a
            href="/api/guides/download/CGU_AfroCrown.pdf"
            target="_blank"
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Conditions générales
          </a>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Supprimer votre compte ?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cette action est <strong className="text-red-400">irréversible</strong>. 
              Toutes vos données seront définitivement supprimées :
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Profil et informations personnelles</li>
                <li>Historique des réservations</li>
                <li>Avis et commentaires</li>
                <li>Points de fidélité et badges</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-slate-300 text-sm mb-2 block">
              Tapez <strong className="text-red-400">SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              placeholder="SUPPRIMER"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-600"
            >
              Annuler
            </Button>
            <Button
              onClick={deleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmText !== "SUPPRIMER"}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacySettings;
