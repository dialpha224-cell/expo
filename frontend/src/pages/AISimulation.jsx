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
  const [rotationAngle, setRotationAngle] = useState(0);
  const carouselRef = useRef(null);

  const rotationLabels = {
    0: "Face",
    90: "Profil Droit",
    180: "Dos",
    270: "Profil Gauche"
  };

  // 30 styles de coiffure avec barbe - Images générées par IA avec cape AfroCrown
  const haircutStyles = [
    { 
      id: "taper-beard",
      name: "Taper Fade + Barbe",
      description: "Dégradé classique avec barbe pleine",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/5a74bd03d51115436d28479c2be767eaf3a6ecf2eebdc673c11baea9501e31f9.png"
    },
    { 
      id: "waves-beard",
      name: "360 Waves + Barbe",
      description: "Ondulations parfaites avec barbe soignée",
      category: "Waves",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/43162635dc0d00a032ccda23f09c1c00a668c10147ce7e6c81257d9eec8794f2.png"
    },
    { 
      id: "hightop-goatee",
      name: "High Top + Bouc",
      description: "Flat top avec bouc stylisé",
      category: "Afro",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/40b52420728e44958ec43d1b43c6ebf627fc4f62d851326ce2ea13f5cfa65142.png"
    },
    { 
      id: "lowfade-stubble",
      name: "Low Fade + Barbe Courte",
      description: "Dégradé bas avec barbe de 3 jours",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2f6f5d11cb075a185e06d5743a8eb1999dff8876d3eedebf66986f45a5ee0c1.png"
    },
    { 
      id: "afro-beard",
      name: "Afro Naturelle + Barbe",
      description: "Afro volumineuse avec barbe pleine",
      category: "Afro",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/f7191e3c2abff0ea8910c590ea46a5526f72a83c50bce88d8b26e2198f7bb711.png"
    },
    { 
      id: "buzz-beard",
      name: "Buzz Cut + Barbe Épaisse",
      description: "Coupe courte avec barbe luxuriante",
      category: "Courts",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/44d43007533a0f29551419ff5e7dcb0286bb49094bebd58a0b2009d05bc71c46.png"
    },
    { 
      id: "skinfade-designer",
      name: "Skin Fade + Barbe Design",
      description: "Dégradé peau avec lignes sculptées",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1cc5a0d53b27b2dccd59175fa06c52b6a17bec24b892989b5f4ca0b4a75adf06.png"
    },
    { 
      id: "cornrows-beard",
      name: "Cornrows + Barbe",
      description: "Tresses plaquées avec barbe soignée",
      category: "Tresses",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/bdb3eac0e84fbe1461b2c24dfce96ad900165677102caf19a4687da360ecccd2.png"
    },
    { 
      id: "fulani-beard",
      name: "Tresses Fulani + Barbe",
      description: "Tresses Fulani avec perles et barbe",
      category: "Tresses",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/2368e2dec7ce77152ed9d3f7340f46b92f6adb7cf7e8f2402de3de8b88e53583.png"
    },
    { 
      id: "shortdreads-beard",
      name: "Dreads Courts + Barbe",
      description: "Locks courts avec barbe épaisse",
      category: "Locks",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b8413b9853ad7a25153d000160a63fe913900717d137f217c971e09706df05c5.png"
    },
    { 
      id: "longdreads-beard",
      name: "Dreads Longs + Barbe",
      description: "Locks longs avec barbe soignée",
      category: "Locks",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/83d2b5f2e66feb00f42f3da42d59370c5b3dd52afc5673c6614edfa81a967f65.png"
    },
    { 
      id: "boxbraids-beard",
      name: "Box Braids + Barbe",
      description: "Tresses box avec barbe",
      category: "Tresses",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ab542ae1dc216b005dc3d4129e920c5a64e802ec1b5ce3072417513c9e64a844.png"
    },
    { 
      id: "twists-beard",
      name: "Two Strand Twists + Barbe",
      description: "Twists avec barbe bien taillée",
      category: "Naturel",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ea04d4455635e9a34c3d458ec2f3dcc6d6a63cd05c694f09965be4a90c825758.png"
    },
    { 
      id: "templefade-curly",
      name: "Temple Fade + Curly Top",
      description: "Dégradé tempes avec boucles",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/df2794ebe0d795d4053f8a6260b7051d9feb4d49f24aa9195a43c6b1d2f245dc.png"
    },
    { 
      id: "mohawk-beard",
      name: "Mohawk Fade + Barbe",
      description: "Crête avec dégradé et barbe",
      category: "Créatifs",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/72803f33fd1066f9034aec361385b429e29f83d94c89a76334e0a5be3fb8ddf5.png"
    },
    { 
      id: "frohawk-goatee",
      name: "Frohawk + Bouc",
      description: "Frohawk naturel avec bouc",
      category: "Créatifs",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/289bb0be7e22cf6acb555643eede436b0270e22c59e4cbfe03aa6de559ea3b5f.png"
    },
    { 
      id: "dropfade-beard",
      name: "Drop Fade + Barbe",
      description: "Dégradé tombant avec barbe",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/51a0fd6b16b029dc9e0f74fd5ca1e1803cc1e283e6da74013ea6422556d356aa.png"
    },
    { 
      id: "burstfade-beard",
      name: "Burst Fade + Barbe",
      description: "Dégradé éclaté avec texture",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/45d97352c35d9d92b46fe8755375b45b5e49aca3da1bd42e313319e91f3ad554.png"
    },
    { 
      id: "flattop-beard",
      name: "Flat Top + Barbe",
      description: "Flat top classique avec barbe",
      category: "Afro",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/973777cd63edf86e0b12f75c56145f6a9224582ecb6a00d1bc3a493b46c5f4c5.png"
    },
    { 
      id: "bald-fullbeard",
      name: "Crâne Rasé + Barbe Pleine",
      description: "Tête rasée avec barbe luxuriante",
      category: "Courts",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/6c5cde2836906732a1c431c826b5070ea52279f9c734979ec5e4558c6017d6b7.png"
    },
    { 
      id: "sidepart-beard",
      name: "Raie sur le Côté + Barbe",
      description: "Coupe classique avec raie",
      category: "Classiques",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/a430e13090c40f0bc64e1d05a1fbaebb9c67827b5e296b3c9799d58f1f2169e1.png"
    },
    { 
      id: "combover-beard",
      name: "Comb Over + Barbe",
      description: "Coupe peignée avec barbe soignée",
      category: "Classiques",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/20af7735ebeb3253f02d6f197e26ae05e8f2bb8bb9a8d81f48975fa9c0d2aad4.png"
    },
    { 
      id: "edgar-beard",
      name: "Edgar Cut + Barbe",
      description: "Coupe Edgar avec barbe fine",
      category: "Tendance",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ba8aa82c90b19714624ca5adc0ca003f37ef746be37acef21ac46157e07c467e.png"
    },
    { 
      id: "texturedcrop-beard",
      name: "Texture Crop + Barbe",
      description: "Coupe texturée avec ombre de barbe",
      category: "Tendance",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/d9bc229084a7d1bcdb5c85d921e50a0db42c5077cb1a0b02284a91e2f20e87a9.png"
    },
    { 
      id: "midfade-curls",
      name: "Mid Fade + Boucles",
      description: "Dégradé moyen avec curls",
      category: "Dégradés",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/3eb45be6976c1ab3463e48bc3dcbc9cf6461bb331014491e2783662e7c532de0.png"
    },
    { 
      id: "twistout-beard",
      name: "Twist Out + Barbe",
      description: "Cheveux naturels définis",
      category: "Naturel",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/0dcaa98a76adde5f5a2a2d93bd2965634d0ba4e962fc7f1e41e788e64d3493e6.png"
    },
    { 
      id: "fingercoils-beard",
      name: "Finger Coils + Barbe",
      description: "Coils définies avec barbe",
      category: "Naturel",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ec8ec68c45eb05545778c343a7f013edf52fff36f3361046b14f637f08e5b10a.png"
    },
    { 
      id: "tapernatural-beard",
      name: "Taper Naturel + Barbe Fine",
      description: "Dégradé naturel avec barbe fine",
      category: "Naturel",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/49f1d6bec044b43e8bfe8e4a0806ee64b3a9b0508031ae83813289d56061f114.png"
    },
    { 
      id: "manbun-beard",
      name: "Man Bun + Barbe",
      description: "Chignon homme avec barbe pleine",
      category: "Longs",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1565826087ce99280dfbc444cfed92d0a95d85c88d43c1b44923b33164fa14d5.png"
    },
    { 
      id: "freeformlocs-beard",
      name: "Freeform Locs + Barbe",
      description: "Locks libres avec barbe sauvage",
      category: "Locks",
      thumbnail: "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1efb8f974489ab464d528e8fa9f1a403da994da578a77c895934add06bd6a8ee.png"
    }
  ];

  // Get unique categories
  const categories = [...new Set(haircutStyles.map(s => s.category))];
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredStyles = selectedCategory === "Tous" 
    ? haircutStyles 
    : haircutStyles.filter(s => s.category === selectedCategory);

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
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const applyStyleToMannequin = (style) => {
    setMannequinStyle(style);
    setSelectedStyle(style.id);
    toast.success(`Style "${style.name}" sélectionné !`);
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
            <span className="text-[#FFD700] text-sm">30+ Styles Disponibles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Simulez votre future coupe
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Découvrez notre collection de 30 styles de coiffure africaine avec barbe. Choisissez votre style et visualisez-le sur vous.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory("Tous")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "Tous"
                ? 'bg-[#FFD700] text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tous ({haircutStyles.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FFD700] text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Display + Carousel */}
        <div className="mb-10 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Main Display */}
            <div className="relative flex-shrink-0">
              <div className="text-center mb-3">
                <span className="text-[#FFD700] text-sm font-medium">Aperçu du Style</span>
              </div>
              
              <div className="relative w-80 h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-[#FFD700]/30 shadow-2xl shadow-[#FFD700]/10">
                <AnimatePresence mode="wait">
                  {mannequinStyle ? (
                    <motion.img
                      key={mannequinStyle.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      src={mannequinStyle.thumbnail}
                      alt={mannequinStyle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center text-center p-6"
                    >
                      <Scissors className="h-16 w-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 text-lg">Sélectionnez un style</p>
                      <p className="text-slate-500 text-sm">30+ coupes disponibles</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {mannequinStyle && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3">
                      <p className="text-[#FFD700] font-bold">{mannequinStyle.name}</p>
                      <p className="text-slate-400 text-sm">{mannequinStyle.description}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#FFD700]/20 rounded text-[#FFD700] text-xs">
                        {mannequinStyle.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {mannequinStyle && (
                <button 
                  onClick={() => {
                    setMannequinStyle(null);
                    setSelectedStyle("");
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
                <span className="text-white font-medium text-lg">
                  {selectedCategory === "Tous" ? "Tous les styles" : selectedCategory} ({filteredStyles.length})
                </span>
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
                {filteredStyles.map((style, index) => (
                  <motion.button
                    key={`${style.id}-${index}`}
                    onClick={() => applyStyleToMannequin(style)}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex-shrink-0 w-40 rounded-xl overflow-hidden border-2 transition-all ${
                      mannequinStyle?.id === style.id 
                        ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/40 ring-2 ring-[#FFD700]/50' 
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    data-testid={`style-${style.id}`}
                  >
                    <div className="w-full h-40 bg-slate-800 overflow-hidden">
                      <img 
                        src={style.thumbnail} 
                        alt={style.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className={`p-2.5 ${
                      mannequinStyle?.id === style.id 
                        ? 'bg-[#FFD700] text-slate-900' 
                        : 'bg-slate-700 text-white'
                    }`}>
                      <p className="text-xs font-bold truncate">{style.name}</p>
                      <p className={`text-xs truncate ${
                        mannequinStyle?.id === style.id 
                          ? 'text-slate-700' 
                          : 'text-slate-400'
                      }`}>{style.category}</p>
                    </div>
                    
                    {mannequinStyle?.id === style.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
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
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 rounded text-slate-300 text-xs">
                      {mannequinStyle.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 text-center">
                  <Scissors className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Choisissez parmi nos 30 styles</p>
                </div>
              )}
            </div>

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
      </main>
      
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
