import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { 
  FileText, 
  Download, 
  BookOpen,
  Users,
  Scissors,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const UserGuides = ({ variant = "full" }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await axios.get(`${API}/guides`);
      setGuides(response.data);
    } catch (error) {
      console.log("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (guide) => {
    // Direct download via window.open
    const downloadUrl = `${API}${guide.download_url}`;
    window.open(downloadUrl, '_blank');
    toast.success(`Téléchargement de ${guide.name} en cours...`);
  };

  const getGuideIcon = (filename) => {
    if (filename.toLowerCase().includes("client")) {
      return <Users className="h-6 w-6 text-amber-400" />;
    }
    if (filename.toLowerCase().includes("salon")) {
      return <Scissors className="h-6 w-6 text-purple-400" />;
    }
    return <FileText className="h-6 w-6 text-indigo-400" />;
  };

  const getGuideDescription = (filename) => {
    if (filename.toLowerCase().includes("client")) {
      return "Guide complet pour les clients : réservation, simulation IA, programme fidélité...";
    }
    if (filename.toLowerCase().includes("salon")) {
      return "Guide pour les salons : gestion des rendez-vous, équipe, analytics...";
    }
    return "Documentation utilisateur";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-3" data-testid="user-guides-compact">
        {guides.map((guide) => (
          <Button
            key={guide.filename}
            onClick={() => handleDownload(guide)}
            variant="outline"
            className="border-slate-600 hover:bg-slate-700 text-slate-300"
          >
            <Download className="h-4 w-4 mr-2" />
            {guide.name}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="user-guides">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BookOpen className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Guides Utilisateur</h3>
          <p className="text-slate-400 text-sm">Téléchargez nos guides pour bien démarrer</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <div
            key={guide.filename}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-700/50 rounded-lg shrink-0">
                {getGuideIcon(guide.filename)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium mb-1">{guide.name}</h4>
                <p className="text-slate-400 text-sm mb-3">
                  {getGuideDescription(guide.filename)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">
                    PDF • {guide.size_kb} Ko
                  </span>
                  <Button
                    onClick={() => handleDownload(guide)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserGuides;
