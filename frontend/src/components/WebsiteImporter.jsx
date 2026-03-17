import { useState } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Globe, 
  Upload,
  Check,
  Scissors,
  Users,
  Image,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const WebsiteImporter = ({ salonId, onImportComplete }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [options, setOptions] = useState({
    import_services: true,
    import_barbers: true,
    import_gallery: true
  });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImport = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Veuillez entrer l'URL de votre site");
      return;
    }

    // Basic URL validation
    if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
      toast.error("L'URL doit commencer par http:// ou https://");
      return;
    }

    setImporting(true);
    try {
      const response = await axios.post(
        `${API}/salons/${salonId}/import-website`,
        {
          website_url: websiteUrl,
          ...options
        },
        { withCredentials: true }
      );

      setImportResult(response.data);
      toast.success("Demande d'import envoyee !");

      if (onImportComplete) {
        onImportComplete(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setWebsiteUrl("");
    setOptions({ import_services: true, import_barbers: true, import_gallery: true });
    setImportResult(null);
  };

  const importOptions = [
    { key: "import_services", label: "Services et tarifs", icon: Scissors, description: "Importer vos coupes et leurs prix" },
    { key: "import_barbers", label: "Equipe", icon: Users, description: "Importer les profils de vos coiffeurs" },
    { key: "import_gallery", label: "Galerie photos", icon: Image, description: "Importer vos photos de realisations" }
  ];

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="border-slate-600 text-white hover:bg-slate-700"
        data-testid="open-website-importer-btn"
      >
        <Globe className="w-4 h-4 mr-2" />
        Importer mon site
      </Button>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetDialog(); }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Importer votre site existant
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Nous adaptons les donnees de votre site au format AfroCrown
            </DialogDescription>
          </DialogHeader>

          {!importResult ? (
            <div className="py-4 space-y-6">
              {/* Website URL */}
              <div>
                <label className="text-slate-300 text-sm mb-2 block">URL de votre site</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://monsalon.com"
                    className="bg-slate-700 border-slate-600 text-white pl-11"
                    data-testid="website-url-input"
                  />
                </div>
              </div>

              {/* Import Options */}
              <div>
                <label className="text-slate-300 text-sm mb-3 block">Données à importer</label>
                <div className="space-y-3">
                  {importOptions.map((option) => (
                    <label
                      key={option.key}
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        options[option.key]
                          ? "bg-indigo-600/20 border-2 border-indigo-500"
                          : "bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <Checkbox
                        checked={options[option.key]}
                        onCheckedChange={(checked) => setOptions({ ...options, [option.key]: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <option.icon className={`w-4 h-4 ${options[option.key] ? "text-indigo-400" : "text-slate-400"}`} />
                          <span className="text-white font-medium">{option.label}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-2">Comment ça marche ?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Entrez l'URL de votre site actuel</li>
                  <li>Notre système analyse automatiquement votre contenu</li>
                  <li>Services, prix et photos sont importés</li>
                  <li>Vérifiez et ajustez les données importées</li>
                </ol>
              </div>

              <Button
                onClick={handleImport}
                disabled={importing || !websiteUrl.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-testid="start-import-btn"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Lancer l'import
                  </>
                )}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {importResult.status === 'completed' ? 'Import réussi !' : 'Demande envoyée !'}
              </h3>
              
              <p className="text-slate-400 mb-4">
                {importResult.message}
              </p>

              {/* Extracted Data Summary */}
              {importResult.extracted && (
                <div className="bg-slate-700/50 rounded-xl p-4 text-left mb-4 space-y-3">
                  <p className="text-slate-300 font-medium text-sm mb-2">Données extraites :</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-300">{importResult.extracted.services_found} services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300">{importResult.extracted.images_imported || 0} photos</span>
                    </div>
                  </div>
                  {importResult.extracted.phones_found?.length > 0 && (
                    <p className="text-slate-400 text-xs">
                      Tél: {importResult.extracted.phones_found[0]}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-slate-700/50 rounded-xl p-4 text-left mb-6">
                <p className="text-slate-400 text-sm">ID de l'import</p>
                <p className="text-indigo-400 font-mono text-sm">{importResult.import_id}</p>
              </div>

              <Button
                onClick={() => { setShowDialog(false); resetDialog(); }}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Fermer
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebsiteImporter;
