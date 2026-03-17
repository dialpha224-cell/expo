import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { ArrowLeft, BookOpen, Download, FileText, Users, Scissors, Shield } from "lucide-react";
import { toast } from "sonner";

const GuidesPage = () => {
  const navigate = useNavigate();
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
      console.error("Error fetching guides:", error);
      toast.error("Erreur lors du chargement des guides");
    } finally {
      setLoading(false);
    }
  };

  const getGuideIcon = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes("client")) return <Users className="h-6 w-6 text-amber-400" />;
    if (name.includes("salon")) return <Scissors className="h-6 w-6 text-purple-400" />;
    if (name.includes("fondateur")) return <BookOpen className="h-6 w-6 text-green-400" />;
    if (name.includes("confidentialite") || name.includes("cgu")) return <Shield className="h-6 w-6 text-blue-400" />;
    return <FileText className="h-6 w-6 text-indigo-400" />;
  };

  const getGuideDescription = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes("client")) return "Guide complet pour les clients : réservation, simulation IA, programme fidélité...";
    if (name.includes("salon")) return "Guide pour les salons : gestion des rendez-vous, équipe, analytics...";
    if (name.includes("fondateur")) return "Guide d'administration de la plateforme AfroCrown";
    if (name.includes("confidentialite")) return "Politique de confidentialité et protection des données (RGPD)";
    if (name.includes("cgu")) return "Conditions Générales d'Utilisation de la plateforme";
    return "Documentation utilisateur";
  };

  const handleDownload = (guide) => {
    const downloadUrl = `${API}${guide.download_url}`;
    window.open(downloadUrl, '_blank');
    toast.success(`Téléchargement de ${guide.name}...`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="guides-page">
      {/* Header */}
      <header className="bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#FFD700]" />
                <span className="text-xl font-bold text-[#FFD700]">AfroCrown</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Guides & Documents
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Téléchargez nos guides complets pour tirer le meilleur parti d'AfroCrown.
          </p>
        </div>

        {/* Guides Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
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
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Besoin d'aide supplémentaire ?
          </h3>
          <p className="text-slate-400 mb-4">
            Notre équipe est disponible pour vous accompagner
          </p>
          <Button
            onClick={() => window.location.href = "mailto:support@afrocrown.com"}
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
          >
            Contacter le support
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GuidesPage;
