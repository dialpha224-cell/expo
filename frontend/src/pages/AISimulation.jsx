import { useState, useRef, useEffect } from "react";
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { toast } from "sonner";

const AISimulation = () => {
  const { user, login } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mannequinStyle, setMannequinStyle] = useState(null);
  const carouselRef = useRef(null);

  // Styles de coupe avec images
  const haircutStyles = [
    { 
      id: "fade", 
      name: "Dégradé Classique", 
      description: "Dégradé progressif élégant",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "afro", 
      name: "Afro Naturelle", 
      description: "Afro volumineuse et sculptée",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "buzz", 
      name: "Buzz Cut", 
      description: "Coupe courte uniforme",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "high-top", 
      name: "High Top Fade", 
      description: "Afro haute avec dégradé",
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "waves", 
      name: "360 Waves", 
      description: "Ondulations parfaites",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "locks", 
      name: "Starter Locks", 
      description: "Début de locks stylisées",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "braids", 
      name: "Cornrows", 
      description: "Tresses plaquées",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    },
    { 
      id: "mohawk", 
      name: "Mohawk Fade", 
      description: "Crête avec dégradé",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      overlay: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)"
    }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current && !mannequinStyle) {
        carouselRef.current.scrollLeft += 1;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    }, 30);
    return () => clearInterval(interval);
  }, [mannequinStyle]);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const applyStyleToMannequin = (style) => {
    setMannequinStyle(style);
    setSelectedStyle(style.id);
    toast.success(`Style "${style.name}" appliqué au mannequin !`);
  };

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
      toast.error("Veuillez sélectionner un style de coupe");
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
        toast.success("Simulation générée avec succès !");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Erreur lors de la simulation. Veuillez réessayer.");
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
              <Scissors className="h-6 w-6 text-[#FFD700]" />
              <span className="font-heading font-bold text-white">AfroCrown</span>
            </a>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFD700]" />
              <span className="text-[#FFD700] font-medium">Simulation IA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </a>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-2 mb-4">
            <Wand2 className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm">Propulsé par l'IA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Simulez votre future coupe
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cliquez sur une coupe pour la visualiser sur le mannequin, puis utilisez votre photo pour une simulation personnalisée.
          </p>
        </div>

        {/* ============================================ */}
        {/* BANNIÈRE DÉFILANTE AVEC MANNEQUIN */}
        {/* ============================================ */}
        <div className="mb-10 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Mannequin Section */}
            <div className="relative flex-shrink-0">
              <div className="text-center mb-3">
                <span className="text-[#FFD700] text-sm font-medium">Mannequin Virtuel</span>
              </div>
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-[#FFD700]/30 shadow-2xl shadow-[#FFD700]/10">
                {/* Base Mannequin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Silhouette de base */}
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8B6914" />
                          <stop offset="100%" stopColor="#6B4E0A" />
                        </linearGradient>
                      </defs>
                      {/* Visage */}
                      <ellipse cx="100" cy="95" rx="55" ry="65" fill="url(#skinGradient)" />
                      {/* Cou */}
                      <rect x="80" y="150" width="40" height="50" fill="url(#skinGradient)" />
                      {/* Épaules */}
                      <ellipse cx="100" cy="195" rx="80" ry="25" fill="#4A5568" />
                      {/* Yeux */}
                      <ellipse cx="75" cy="90" rx="8" ry="5" fill="#1a1a1a" />
                      <ellipse cx="125" cy="90" rx="8" ry="5" fill="#1a1a1a" />
                      {/* Nez */}
                      <path d="M95 100 Q100 115 105 100" stroke="#6B4E0A" strokeWidth="2" fill="none" />
                      {/* Bouche */}
                      <path d="M80 125 Q100 135 120 125" stroke="#8B4513" strokeWidth="3" fill="none" />
                      {/* Oreilles */}
                      <ellipse cx="45" cy="95" rx="8" ry="15" fill="url(#skinGradient)" />
                      <ellipse cx="155" cy="95" rx="8" ry="15" fill="url(#skinGradient)" />
                    </svg>
                    
                    {/* Cheveux overlay basé sur le style sélectionné */}
                    {mannequinStyle && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0 left-0 w-full h-full"
                      >
                        <img 
                          src={mannequinStyle.image} 
                          alt={mannequinStyle.name}
                          className="w-full h-full object-cover rounded-2xl"
                          style={{ 
                            clipPath: 'ellipse(45% 50% at 50% 40%)',
                            filter: 'brightness(1.1)'
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Style appliqué badge */}
                {mannequinStyle && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-center"
                  >
                    <p className="text-[#FFD700] font-bold text-sm">{mannequinStyle.name}</p>
                    <p className="text-slate-400 text-xs">{mannequinStyle.description}</p>
                  </motion.div>
                )}
                
                {/* Placeholder si pas de style */}
                {!mannequinStyle && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-center">
                    <p className="text-slate-400 text-xs">Cliquez sur une coupe ci-dessous</p>
                  </div>
                )}
              </div>
              
              {/* Reset button */}
              {mannequinStyle && (
                <button 
                  onClick={() => setMannequinStyle(null)}
                  className="mt-3 w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-3 w-3 inline mr-1" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Carousel Section */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Choisissez une coupe</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => scrollCarousel('left')}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Scrolling Carousel */}
              <div 
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {/* Double the items for infinite scroll effect */}
                {[...haircutStyles, ...haircutStyles].map((style, index) => (
                  <motion.button
                    key={`${style.id}-${index}`}
                    onClick={() => applyStyleToMannequin(style)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex-shrink-0 w-32 h-40 rounded-xl overflow-hidden border-2 transition-all ${
                      mannequinStyle?.id === style.id 
                        ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/30' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    data-testid={`carousel-style-${style.id}`}
                  >
                    <img 
                      src={style.image} 
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium truncate">{style.name}</p>
                    </div>
                    {mannequinStyle?.id === style.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                        <Scissors className="h-3 w-3 text-slate-900" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Simulation Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Image URL Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#FFD700]" />
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
                Utilisez une photo de face avec un bon éclairage pour de meilleurs résultats.
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

            {/* Selected Style Display */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-[#FFD700]" />
                Style sélectionné
              </h3>
              {mannequinStyle ? (
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-[#FFD700]/30">
                  <img 
                    src={mannequinStyle.image} 
                    alt={mannequinStyle.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{mannequinStyle.name}</p>
                    <p className="text-slate-400 text-sm">{mannequinStyle.description}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 text-center">
                  <p className="text-slate-400">Cliquez sur une coupe dans la bannière ci-dessus</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleSimulation}
              disabled={loading || !imageUrl || !selectedStyle}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] hover:from-[#FFC107] hover:to-[#D97706] text-slate-900 font-bold py-6 text-lg"
              data-testid="generate-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Générer la simulation
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Result */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#FFD700]" />
              Résultat
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
                      <div className="w-20 h-20 border-4 border-[#FFD700]/30 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-[#FFD700] animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-400 mt-4">Analyse en cours...</p>
                    <p className="text-slate-500 text-sm">Cela peut prendre jusqu'à 1 minute</p>
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
                      Sélectionnez une photo et un style pour voir la simulation
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
                  Télécharger
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedImage(null);
                    setSelectedStyle("");
                    setMannequinStyle(null);
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
          <h3 className="text-white font-medium mb-4">Comment ça marche ?</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold">1</div>
              <div>
                <h4 className="text-white font-medium">Choisissez un style</h4>
                <p className="text-slate-400 text-sm">Cliquez sur une coupe dans la bannière</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold">2</div>
              <div>
                <h4 className="text-white font-medium">Visualisez</h4>
                <p className="text-slate-400 text-sm">Voyez le style sur le mannequin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold">3</div>
              <div>
                <h4 className="text-white font-medium">Uploadez votre photo</h4>
                <p className="text-slate-400 text-sm">Collez l'URL d'une photo de face</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold">4</div>
              <div>
                <h4 className="text-white font-medium">Découvrez le résultat</h4>
                <p className="text-slate-400 text-sm">L'IA génère une simulation réaliste</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AISimulation;
