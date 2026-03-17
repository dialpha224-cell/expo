import { useNavigate } from "react-router-dom";
import UserGuides from "../components/UserGuides";
import { Button } from "../components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

const GuidesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="guides-page">
      {/* Header */}
      <header className="bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
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
            Guides Utilisateur
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Téléchargez nos guides complets pour tirer le meilleur parti d'AfroCrown,
            que vous soyez client ou propriétaire de salon.
          </p>
        </div>

        <UserGuides variant="full" />

        {/* Additional Help Section */}
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
