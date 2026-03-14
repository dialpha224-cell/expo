import { useState } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  ArrowLeft, 
  Upload,
  Sparkles,
  RefreshCw,
  Download,
  Wand2,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const AISimulation = () => {
  const { user, login } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const haircutStyles = [
    { id: "fade", name: "Degrade Classique", description: "Degrade progressif elegant" },
    { id: "afro", name: "Afro Naturelle", description: "Afro volumineuse et sculptee" },
    { id: "buzz", name: "Buzz Cut", description: "Coupe courte uniforme" },
    { id: "high-top", name: "High Top Fade", description: "Afro haute avec degrade" },
    { id: "waves", name: "360 Waves", description: "Ondulations parfaites" },
    { id: "locks", name: "Starter Locks", description: "Debut de locks stylisees" },
    { id: "braids", name: "Cornrows", description: "Tresses plaquees" },
    { id: "mohawk", name: "Mohawk Fade", description: "Crete avec degrade" }
  ];

  const handleSimulation = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour utiliser la simulation IA");
      login();
      return;
    }

    if (!imageUrl) {
      toast.error("Veuillez entrer l'URL d'une image");
      return;
    }

    if (!selectedStyle) {
      toast.error("Veuillez selectionner un style de coupe");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const style = haircutStyles.find(s => s.id === selectedStyle);
      const response = await axios.post(`${API}/ai/simulate-haircut`, {
        image_url: imageUrl,
        haircut_style: style?.name || selectedStyle
      }, { withCredentials: true });

      if (response.data.image_base64) {
        setGeneratedImage(`data:image/png;base64,${response.data.image_base64}`);
        toast.success("Simulation generee avec succes !");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Erreur lors de la simulation. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `afrocrown-simulation-${selectedStyle}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-indigo-500" />
              <span className="font-heading font-bold text-white">AfroCrown</span>
            </a>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Simulation IA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </a>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-4">
            <Wand2 className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">Propulse par l'IA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Simulez votre future coupe
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Uploadez une photo et decouvrez a quoi vous ressembleriez avec differents styles de coiffure afro.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Image URL Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-400" />
                Votre photo
              </h3>
              <Input
                placeholder="Collez l'URL de votre photo..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white mb-4"
                data-testid="image-url-input"
              />
              <p className="text-slate-500 text-sm">
                Utilisez une photo de face avec un bon eclairage pour de meilleurs resultats.
              </p>
              
              {imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden bg-slate-700">
                  <img 
                    src={imageUrl} 
                    alt="Photo originale" 
                    className="w-full h-48 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Style Selection */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-indigo-400" />
                Style de coupe
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {haircutStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedStyle === style.id
                        ? 'bg-indigo-600 border-indigo-500'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    } border`}
                    data-testid={`style-${style.id}`}
                  >
                    <div className={`font-medium ${selectedStyle === style.id ? 'text-white' : 'text-slate-300'}`}>
                      {style.name}
                    </div>
                    <div className={`text-xs ${selectedStyle === style.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {style.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleSimulation}
              disabled={loading || !imageUrl || !selectedStyle}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 py-6 text-lg"
              data-testid="generate-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Generation en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generer la simulation
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Result */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
              Resultat
            </h3>
            
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-400 mt-4">Analyse en cours...</p>
                    <p className="text-slate-500 text-sm">Cela peut prendre jusqu'a 1 minute</p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.img
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={generatedImage}
                    alt="Simulation"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8"
                  >
                    <Wand2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">
                      Selectionnez une photo et un style pour voir la simulation
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex gap-4"
              >
                <Button
                  onClick={downloadImage}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                  data-testid="download-btn"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Telecharger
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedImage(null);
                    setSelectedStyle("");
                  }}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="reset-btn"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recommencer
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Comment ca marche ?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h4 className="text-white font-medium">Uploadez votre photo</h4>
                <p className="text-slate-400 text-sm">Collez l'URL d'une photo de face</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h4 className="text-white font-medium">Choisissez un style</h4>
                <p className="text-slate-400 text-sm">Selectionnez la coupe qui vous interesse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h4 className="text-white font-medium">Decouvrez le resultat</h4>
                <p className="text-slate-400 text-sm">L'IA genere une simulation realiste</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AISimulation;
