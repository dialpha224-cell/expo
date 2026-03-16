import { useState, useRef, useEffect } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  ArrowLeft, 
  Sparkles,
  RefreshCw,
  Download,
  Wand2,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw
} from "lucide-react";
import { toast } from "sonner";

const AISimulation = () => {
  const { user, login } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mannequinStyle, setMannequinStyle] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0); // 0, 90, 180, 270
  const carouselRef = useRef(null);

  // Rotation views (0=front, 90=right, 180=back, 270=left)
  const rotationLabels = {
    0: "Face",
    90: "Profil Droit",
    180: "Dos",
    270: "Profil Gauche"
  };

  // Styles de coupe avec images réalistes de barbershop pour chaque angle
  const haircutStyles = [
    { 
      id: "fade", 
      name: "Dégradé Classique", 
      description: "Taper fade avec top texturé",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/dfeafa8586f94c53869e4909c702c11c1d60fbf46070e975667eaaa5dd0cbe1b.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/d82f724e94a1c8ecb619c285841d2137cc89ce0696a45ad4568f4426447ec8ed.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/0dba3dcdf1cf089259d0031af567054414af974f50113c3e14b1d628ce6d8151.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/9128b98610143cacb53d7015cdd6ba19b1c6828306d974ee5294cd1b02920125.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/d20f931dac23022cba1e68df53677dd2a8b9489420b81ee8cd8b335c7fae05f3.png"
    },
    { 
      id: "afro", 
      name: "Afro Naturelle", 
      description: "Afro volumineuse classique",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/13421f2835100d1b5d5fd6840a9a2f49d00270b4c1beccb70826523e9ab2167b.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/13421f2835100d1b5d5fd6840a9a2f49d00270b4c1beccb70826523e9ab2167b.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/13421f2835100d1b5d5fd6840a9a2f49d00270b4c1beccb70826523e9ab2167b.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/13421f2835100d1b5d5fd6840a9a2f49d00270b4c1beccb70826523e9ab2167b.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/13421f2835100d1b5d5fd6840a9a2f49d00270b4c1beccb70826523e9ab2167b.png"
    },
    { 
      id: "buzz", 
      name: "Buzz Cut", 
      description: "Coupe courte uniforme",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c669ae02800f0fdab9dd26b69c40b131328cef0244e23e8a0daabf57dc163df5.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c669ae02800f0fdab9dd26b69c40b131328cef0244e23e8a0daabf57dc163df5.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c669ae02800f0fdab9dd26b69c40b131328cef0244e23e8a0daabf57dc163df5.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c669ae02800f0fdab9dd26b69c40b131328cef0244e23e8a0daabf57dc163df5.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c669ae02800f0fdab9dd26b69c40b131328cef0244e23e8a0daabf57dc163df5.png"
    },
    { 
      id: "high-top", 
      name: "High Top Fade", 
      description: "Flat top avec dégradé",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/85515bcbf5f358a8138bebbacd46090bb676eda476017494b26f112b299d4005.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/85515bcbf5f358a8138bebbacd46090bb676eda476017494b26f112b299d4005.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/85515bcbf5f358a8138bebbacd46090bb676eda476017494b26f112b299d4005.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/85515bcbf5f358a8138bebbacd46090bb676eda476017494b26f112b299d4005.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/85515bcbf5f358a8138bebbacd46090bb676eda476017494b26f112b299d4005.png"
    },
    { 
      id: "waves", 
      name: "360 Waves", 
      description: "Ondulations brossées",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/075823329fb61e89d9440ee292adf6e9bd9f45c10766ce08e44d52f6920d9615.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/075823329fb61e89d9440ee292adf6e9bd9f45c10766ce08e44d52f6920d9615.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/075823329fb61e89d9440ee292adf6e9bd9f45c10766ce08e44d52f6920d9615.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/075823329fb61e89d9440ee292adf6e9bd9f45c10766ce08e44d52f6920d9615.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/075823329fb61e89d9440ee292adf6e9bd9f45c10766ce08e44d52f6920d9615.png"
    },
    { 
      id: "locks", 
      name: "Starter Locks", 
      description: "Début de locks stylisées",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2971fe2636f4ee5110db43804d05f97480cfbb6b123611ebb3ec98ba3e0095e.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2971fe2636f4ee5110db43804d05f97480cfbb6b123611ebb3ec98ba3e0095e.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2971fe2636f4ee5110db43804d05f97480cfbb6b123611ebb3ec98ba3e0095e.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2971fe2636f4ee5110db43804d05f97480cfbb6b123611ebb3ec98ba3e0095e.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2971fe2636f4ee5110db43804d05f97480cfbb6b123611ebb3ec98ba3e0095e.png"
    },
    { 
      id: "braids", 
      name: "Cornrows", 
      description: "Tresses plaquées",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c7cc8305be6bddc42c9accb92e8d3415d22b1e58d489ed47afd63769c8aab73c.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c7cc8305be6bddc42c9accb92e8d3415d22b1e58d489ed47afd63769c8aab73c.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c7cc8305be6bddc42c9accb92e8d3415d22b1e58d489ed47afd63769c8aab73c.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c7cc8305be6bddc42c9accb92e8d3415d22b1e58d489ed47afd63769c8aab73c.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/c7cc8305be6bddc42c9accb92e8d3415d22b1e58d489ed47afd63769c8aab73c.png"
    },
    { 
      id: "mohawk", 
      name: "Mohawk Fade", 
      description: "Crête avec dégradé",
      views: {
        0: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a154506024cb535a0dc7db96df3ba64e861265e5120372abe725ccce1ca50eff.png",
        90: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a154506024cb535a0dc7db96df3ba64e861265e5120372abe725ccce1ca50eff.png",
        180: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a154506024cb535a0dc7db96df3ba64e861265e5120372abe725ccce1ca50eff.png",
        270: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a154506024cb535a0dc7db96df3ba64e861265e5120372abe725ccce1ca50eff.png"
      },
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a154506024cb535a0dc7db96df3ba64e861265e5120372abe725ccce1ca50eff.png"
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

  const rotateView = (direction) => {
    setRotationAngle(prev => {
      if (direction === 'right') {
        return prev >= 270 ? 0 : prev + 90;
      } else {
        return prev <= 0 ? 270 : prev - 90;
      }
    });
  };

  const applyStyleToMannequin = (style) => {
    setMannequinStyle(style);
    setSelectedStyle(style.id);
    setRotationAngle(0); // Reset to front view
    toast.success(`Style "${style.name}" sélectionné !`);
  };

  const getCurrentViewImage = () => {
    if (!mannequinStyle) return null;
    return mannequinStyle.views[rotationAngle];
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
            Sélectionnez un style, tournez la vue à 360° pour voir tous les angles, puis générez votre simulation personnalisée.
          </p>
        </div>

        {/* ============================================ */}
        {/* MANNEQUIN 360° + CARROUSEL */}
        {/* ============================================ */}
        <div className="mb-10 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Mannequin 360° Section */}
            <div className="relative flex-shrink-0">
              <div className="text-center mb-3">
                <span className="text-[#FFD700] text-sm font-medium">Vue 360° - {rotationLabels[rotationAngle]}</span>
              </div>
              
              {/* Main Display */}
              <div className="relative w-80 h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-[#FFD700]/30 shadow-2xl shadow-[#FFD700]/10">
                <AnimatePresence mode="wait">
                  {mannequinStyle ? (
                    <motion.img
                      key={`${mannequinStyle.id}-${rotationAngle}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      src={getCurrentViewImage()}
                      alt={`${mannequinStyle.name} - ${rotationLabels[rotationAngle]}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                    >
                      <Scissors className="h-16 w-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 text-lg">Sélectionnez une coupe</p>
                      <p className="text-slate-500 text-sm">dans le carrousel ci-dessous</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Angle indicator overlay */}
                {mannequinStyle && (
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <p className="text-[#FFD700] font-bold text-sm">{mannequinStyle.name}</p>
                    </div>
                    <div className="bg-[#FFD700] rounded-lg px-3 py-1.5">
                      <p className="text-slate-900 font-bold text-xs">{rotationLabels[rotationAngle]}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 360° Rotation Controls */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <button 
                  onClick={() => rotateView('left')}
                  disabled={!mannequinStyle}
                  className="p-3 bg-slate-700 hover:bg-[#FFD700] hover:text-slate-900 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                  title="Tourner à gauche"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                
                {/* Rotation indicator dots */}
                <div className="flex items-center gap-2">
                  {[0, 90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => mannequinStyle && setRotationAngle(angle)}
                      disabled={!mannequinStyle}
                      className={`w-3 h-3 rounded-full transition-all ${
                        rotationAngle === angle 
                          ? 'bg-[#FFD700] scale-125' 
                          : 'bg-slate-600 hover:bg-slate-500'
                      } disabled:opacity-30`}
                      title={rotationLabels[angle]}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={() => rotateView('right')}
                  disabled={!mannequinStyle}
                  className="p-3 bg-slate-700 hover:bg-[#FFD700] hover:text-slate-900 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Tourner à droite"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </div>
              
              {/* Reset button */}
              {mannequinStyle && (
                <button 
                  onClick={() => {
                    setMannequinStyle(null);
                    setSelectedStyle("");
                    setRotationAngle(0);
                  }}
                  className="mt-3 w-full text-center text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Carousel Section */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium text-lg">Choisissez votre style</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => scrollCarousel('left')}
                    className="p-2 bg-slate-700 hover:bg-[#FFD700] hover:text-slate-900 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')}
                    className="p-2 bg-slate-700 hover:bg-[#FFD700] hover:text-slate-900 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Scrolling Carousel */}
              <div 
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {[...haircutStyles, ...haircutStyles].map((style, index) => (
                  <motion.button
                    key={`${style.id}-${index}`}
                    onClick={() => applyStyleToMannequin(style)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex-shrink-0 w-44 rounded-xl overflow-hidden border-3 transition-all ${
                      mannequinStyle?.id === style.id 
                        ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/40 ring-2 ring-[#FFD700]/50' 
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    data-testid={`carousel-style-${style.id}`}
                  >
                    {/* Thumbnail de la coupe */}
                    <div className="w-full h-44 bg-slate-800 overflow-hidden">
                      <img 
                        src={style.thumbnail} 
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Label */}
                    <div className={`p-3 ${
                      mannequinStyle?.id === style.id 
                        ? 'bg-[#FFD700] text-slate-900' 
                        : 'bg-slate-700 text-white'
                    }`}>
                      <p className="text-sm font-bold truncate">{style.name}</p>
                      <p className={`text-xs truncate ${
                        mannequinStyle?.id === style.id 
                          ? 'text-slate-700' 
                          : 'text-slate-400'
                      }`}>{style.description}</p>
                    </div>
                    
                    {/* Badge selected */}
                    {mannequinStyle?.id === style.id && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                        <Scissors className="h-4 w-4 text-slate-900" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              {/* Instruction */}
              <p className="text-slate-500 text-sm mt-2 text-center">
                💡 Cliquez sur une coupe puis utilisez les flèches pour tourner la vue à 360°
              </p>
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
                <div className="flex items-center gap-4 p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
                  <div className="w-20 h-20 bg-slate-700 rounded-lg overflow-hidden">
                    <img 
                      src={mannequinStyle.thumbnail} 
                      alt={mannequinStyle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[#FFD700] font-bold text-lg">{mannequinStyle.name}</p>
                    <p className="text-slate-400">{mannequinStyle.description}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 text-center">
                  <Scissors className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Cliquez sur une coupe dans le carrousel</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleSimulation}
              disabled={loading || !imageUrl || !selectedStyle}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] hover:from-[#FFC107] hover:to-[#D97706] text-slate-900 font-bold py-6 text-lg disabled:opacity-50"
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
                    setRotationAngle(0);
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
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="text-white font-medium">Choisissez un style</h4>
                <p className="text-slate-400 text-sm">Cliquez sur une coupe dans le carrousel</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="text-white font-medium">Vue 360°</h4>
                <p className="text-slate-400 text-sm">Tournez pour voir tous les angles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold flex-shrink-0">3</div>
              <div>
                <h4 className="text-white font-medium">Uploadez votre photo</h4>
                <p className="text-slate-400 text-sm">Collez l'URL d'une photo de face</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-slate-900 font-bold flex-shrink-0">4</div>
              <div>
                <h4 className="text-white font-medium">Découvrez le résultat</h4>
                <p className="text-slate-400 text-sm">L'IA génère votre simulation</p>
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
