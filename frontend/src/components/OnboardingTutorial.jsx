import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  Users,
  Calendar,
  Scissors,
  ShoppingBag,
  BarChart3,
  QrCode,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Rocket
} from "lucide-react";

const ONBOARDING_KEY = "afrocrown_onboarding_completed";

const OnboardingTutorial = ({ userRole = "salon_owner", onComplete, forceShow = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If forceShow is true, always show the tutorial
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    
    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const salonOwnerSteps = [
    {
      icon: Rocket,
      title: "Bienvenue sur AfroCrown !",
      description: "Votre espace salon est pret. Decouvrez comment gerer votre activite en quelques etapes simples.",
      tip: "Ce tutoriel ne dure que 2 minutes",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Gerez vos Coiffeurs",
      description: "Ajoutez votre equipe avec leurs specialites et photos. Les clients pourront choisir leur coiffeur prefere lors de la reservation.",
      tip: "Astuce: Ajoutez des photos professionnelles pour attirer plus de clients",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Scissors,
      title: "Configurez vos Coupes",
      description: "Definissez vos prestations avec les prix et durees. Les clients verront ces options lors de la reservation.",
      tip: "Astuce: Proposez des coupes populaires comme Fade, Waves, Braids",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Calendar,
      title: "Suivez vos Rendez-vous",
      description: "Visualisez toutes les reservations, confirmez ou annulez. Chaque client recoit un QR code unique.",
      tip: "Astuce: Utilisez les filtres pour voir les RDV du jour",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: QrCode,
      title: "Scannez les QR Codes",
      description: "Quand un client arrive, scannez son QR code pour confirmer sa presence. Simple et rapide !",
      tip: "Astuce: Le QR code contient toutes les infos du RDV",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShoppingBag,
      title: "Vendez vos Produits",
      description: "Ajoutez vos produits capillaires au Marketplace. Les clients peuvent acheter en ligne ou au salon.",
      tip: "Astuce: Les produits avec photos se vendent 3x plus",
      color: "from-rose-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "Analysez vos Stats",
      description: "Suivez vos performances: revenus, reservations, produits vendus. Prenez des decisions eclairees.",
      tip: "Astuce: Consultez vos stats chaque semaine",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Vous etes pret !",
      description: "Votre salon est configure. Commencez par ajouter vos coiffeurs et vos coupes pour recevoir vos premieres reservations.",
      tip: "Bonne chance avec AfroCrown !",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  const founderSteps = [
    {
      icon: Rocket,
      title: "Bienvenue Administrateur !",
      description: "Vous avez un controle total sur la plateforme AfroCrown. Decouvrez vos super-pouvoirs.",
      tip: "Ce tutoriel ne dure que 2 minutes",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Gerez les Utilisateurs",
      description: "Creez des comptes pour les proprietaires de salon. Ils recevront un email pour configurer leur mot de passe.",
      tip: "Astuce: Assignez chaque proprietaire a son salon",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Scissors,
      title: "Creez des Salons",
      description: "Ajoutez de nouveaux salons partenaires. Configurez leurs informations et assignez un proprietaire.",
      tip: "Astuce: Verifiez les informations avant publication",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Calendar,
      title: "Supervisez les Reservations",
      description: "Visualisez toutes les reservations de la plateforme. Intervenez si necessaire pour resoudre des problemes.",
      tip: "Astuce: Filtrez par salon ou statut",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analysez la Performance",
      description: "Suivez les KPIs globaux: revenus totaux, nombre de reservations, salons actifs, participation TrimConnect.",
      tip: "Astuce: Les stats vous aident a prendre des decisions strategiques",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Vous etes pret !",
      description: "Vous avez toutes les cles en main pour faire grandir AfroCrown. Bonne gestion !",
      tip: "N'hesitez pas a explorer toutes les fonctionnalites",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  const steps = userRole === "founder" ? founderSteps : salonOwnerSteps;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        data-testid="onboarding-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-10"
            data-testid="onboarding-close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="h-1 bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full bg-gradient-to-r ${currentStepData.color}`}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-lg`}>
                  <currentStepData.icon className="h-10 w-10 text-white" />
                </div>

                {/* Step counter */}
                <div className="text-sm text-slate-500 mb-2">
                  Etape {currentStep + 1} sur {totalSteps}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-heading font-bold text-white mb-4">
                  {currentStepData.title}
                </h2>

                {/* Description */}
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Tip box */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8">
                  <p className="text-sm text-indigo-400">
                    {currentStepData.tip}
                  </p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? "w-8 bg-indigo-500"
                          : index < currentStep
                          ? "bg-indigo-500/50"
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 0}
                className="border-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
                data-testid="onboarding-prev"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Precedent
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-testid="onboarding-next"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  data-testid="onboarding-complete"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Commencer !
                </Button>
              )}
            </div>

            {/* Skip link */}
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-sm text-slate-500 hover:text-slate-400 transition-colors"
              data-testid="onboarding-skip"
            >
              Passer le tutoriel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Export a function to reset onboarding (for testing)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
};

export default OnboardingTutorial;
