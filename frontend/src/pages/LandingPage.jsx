import { useState } from "react";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Calendar, 
  ShoppingBag, 
  Trophy, 
  Star, 
  Users, 
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

const LandingPage = () => {
  const { user, login } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Reservation Simple",
      description: "Reservez votre coupe en quelques clics. Choisissez votre coiffeur et votre creneau."
    },
    {
      icon: Sparkles,
      title: "Simulation IA",
      description: "Visualisez votre future coupe grace a l'intelligence artificielle avant de vous decider."
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Decouvrez les meilleurs produits capillaires selectionnes par nos experts."
    },
    {
      icon: Trophy,
      title: "TrimConnect Battle",
      description: "Participez au concours de coiffure et votez pour vos styles preferes."
    }
  ];

  const stats = [
    { value: "500+", label: "Salons partenaires" },
    { value: "10K+", label: "Clients satisfaits" },
    { value: "50+", label: "Styles disponibles" },
    { value: "4.9", label: "Note moyenne" }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Fonctionnalites</a>
              <a href="/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</a>
              <a href="/trimconnect" className="text-slate-400 hover:text-white transition-colors">TrimConnect</a>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Button 
                  onClick={() => window.location.href = user.role === 'founder' ? '/founder' : '/salon'}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  data-testid="dashboard-btn"
                >
                  Dashboard
                </Button>
              ) : (
                <Button 
                  onClick={login}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  data-testid="login-btn"
                >
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1546641082-f149d4c3c907?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-8">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-indigo-300">TrimConnect Battle - Inscriptions ouvertes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-white mb-6 tracking-tight">
              La Reference de la
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">
                Coiffure Afro
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Reservez, simulez votre coupe avec l'IA, decouvrez les meilleurs produits 
              et participez au plus grand concours de coiffure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={login}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg shadow-indigo-500/25"
                data-testid="get-started-btn"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 py-6 px-8 rounded-xl text-lg"
                onClick={() => setIsVideoPlaying(true)}
                data-testid="watch-video-btn"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir la demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Une plateforme complete pour les clients et les professionnels de la coiffure afro.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover-lift"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TrimConnect CTA Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-slate-800 rounded-2xl p-8 md:p-12 overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <span className="text-amber-500 font-heading font-bold text-xl">TrimConnect Barber Battle</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                  Le plus grand concours de coiffure afro
                </h2>
                <p className="text-slate-400 max-w-lg">
                  Montrez votre talent, gagnez des prix exceptionnels et rejoignez 
                  le Hall of Fame des meilleurs coiffeurs.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider py-4 px-8 rounded-xl"
                  style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
                  onClick={() => window.location.href = '/trimconnect'}
                  data-testid="join-battle-btn"
                >
                  Participer au concours
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => window.location.href = '/trimconnect'}
                  data-testid="view-entries-btn"
                >
                  Voir les participations
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Salons Showcase */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Salons partenaires
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Decouvrez les meilleurs salons de coiffure afro pres de chez vous.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
                data-testid={`salon-card-${i}`}
              >
                <div className="h-48 bg-slate-700 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1549663369-22ac6b052faf?crop=entropy&cs=srgb&fm=jpg&q=85&w=400`}
                    alt="Salon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-white">Salon Excellence {i}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-white text-sm">4.9</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Paris, France</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-400 text-sm">5 coiffeurs</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-indigo-500" />
              <span className="text-lg font-heading font-bold text-white">AfroCrown</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">A propos</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">CGU</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Confidentialite</a>
            </div>
            <div className="text-slate-500 text-sm">
              2024 AfroCrown. Tous droits reserves.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
