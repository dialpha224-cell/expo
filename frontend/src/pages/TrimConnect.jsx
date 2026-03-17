import { useState, useEffect } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown, 
  ThumbsUp, 
  ArrowLeft,
  Scissors,
  Medal,
  Flame,
  Star,
  Upload,
  Play,
  CreditCard,
  Check,
  Building,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

// Logo couronne AfroCrown pour TrimConnect
const CROWN_LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/9b808fc4e303c6a3046e6ff14107d11a2bf66d1418b5dedcfc4504becd301851.png";

const PARTICIPATION_FEE = 50; // Frais de participation en EUR

const TrimConnect = () => {
  const { user, login } = useAuth();
  const [entries, setEntries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [isRegisteredSalon, setIsRegisteredSalon] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyVotes();
      checkSalonRegistration();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [entriesRes, leaderboardRes, hofRes] = await Promise.all([
        axios.get(`${API}/trimconnect/public-gallery`),
        axios.get(`${API}/trimconnect/leaderboard`),
        axios.get(`${API}/trimconnect/hall-of-fame`)
      ]);
      setEntries(entriesRes.data);
      setLeaderboard(leaderboardRes.data);
      setHallOfFame(hofRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVotes = async () => {
    try {
      const response = await axios.get(`${API}/trimconnect/my-votes`, { withCredentials: true });
      setMyVotes(response.data);
    } catch (error) {
      console.log("Not logged in or error fetching votes");
    }
  };

  const checkSalonRegistration = () => {
    // Check if user is a salon owner
    if (user && (user.role === "salon_owner" || user.role === "founder")) {
      setIsRegisteredSalon(true);
    }
  };

  const handleParticipate = () => {
    if (!user) {
      login();
      return;
    }

    if (isRegisteredSalon) {
      // Salon inscrit - accès direct au formulaire
      setShowSubmitDialog(true);
    } else {
      // Non inscrit - doit s'inscrire et payer
      setShowRegisterDialog(true);
      setRegistrationStep(1);
    }
  };

  const handlePayParticipationFee = async () => {
    setProcessingPayment(true);
    try {
      // Create Stripe checkout for participation fee
      const response = await axios.post(`${API}/payments/trimconnect-fee`, {
        origin_url: window.location.origin
      }, { withCredentials: true });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error("Erreur lors du paiement. Veuillez réessayer.");
      console.error("Payment error:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const submitEntry = async () => {
    if (!user) {
      login();
      return;
    }

    if (!newEntry.title || !newEntry.image_url) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await axios.post(`${API}/trimconnect/entries`, newEntry, { withCredentials: true });
      toast.success("Participation soumise avec succès !");
      setShowSubmitDialog(false);
      setNewEntry({ title: "", description: "", image_url: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la soumission");
    }
  };

  const vote = async (entryId) => {
    if (!user) {
      login();
      return;
    }

    const hasVotedForEntry = myVotes.includes(entryId);

    try {
      if (hasVotedForEntry) {
        await axios.delete(`${API}/trimconnect/${entryId}/vote`, { withCredentials: true });
        setMyVotes(myVotes.filter(id => id !== entryId));
        toast.success("Vote retiré");
      } else {
        await axios.post(`${API}/trimconnect/${entryId}/vote`, {}, { withCredentials: true });
        setMyVotes([...myVotes, entryId]);
        toast.success("Vote enregistré !");
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du vote");
    }
  };

  const hasVoted = (entryId) => myVotes.includes(entryId);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-[#FFD700]" />
                <span className="font-heading font-bold text-white">AfroCrown</span>
              </a>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-amber-500 font-heading font-bold">TrimConnect Battle</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-slate-400 text-sm hidden sm:block">{user.name}</span>
                  {isRegisteredSalon && (
                    <span className="hidden sm:flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3" />
                      Salon inscrit
                    </span>
                  )}
                  <Button 
                    onClick={handleParticipate}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900" 
                    data-testid="participate-btn"
                  >
                    {isRegisteredSalon ? "Participer" : "S'inscrire"}
                  </Button>
                </>
              ) : (
                <Button onClick={login} className="bg-[#FFD700] hover:bg-[#FFC107] text-slate-900" data-testid="login-btn">
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD700]/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Flame className="h-6 w-6 text-amber-500" />
              <span className="text-amber-500 font-heading font-bold uppercase tracking-wider">
                Edition 2024-H2
              </span>
              <Flame className="h-6 w-6 text-amber-500" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6">
              <span className="relative inline-block">
                {/* Couronne accrochée sur le T */}
                <img 
                  src={CROWN_LOGO_URL} 
                  alt="Crown" 
                  className="absolute -top-8 sm:-top-10 lg:-top-12 -left-2 sm:-left-3 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 transform -rotate-12 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#FFD700]">T</span>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#FFD700]">rim</span>
              <span className="text-white">Connect</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#FFD700]">
                Barber Battle
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Le plus grand concours de coiffure afro. Montrez votre talent, 
              gagnez des prix exceptionnels et rejoignez le Hall of Fame.
            </p>

            {/* Participation Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-4">
                <Building className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Salons Inscrits</h3>
                <p className="text-slate-400 text-sm mb-2">Participation gratuite et illimitée</p>
                <span className="inline-block bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
                  Accès direct
                </span>
              </div>
              <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
                <UserPlus className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Nouveaux Participants</h3>
                <p className="text-slate-400 text-sm mb-2">Frais d'inscription unique</p>
                <span className="inline-block bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full">
                  {PARTICIPATION_FEE} EUR
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleParticipate}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider py-6 px-8 rounded-xl"
                style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
                data-testid="join-now-btn"
              >
                {user && isRegisteredSalon ? "Soumettre une création" : "Participer maintenant"}
              </Button>
              <a href="#leaderboard">
                <Button 
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800 py-6 px-8 rounded-xl"
                  data-testid="view-leaderboard-btn"
                >
                  Voir le classement
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Registration Dialog for Non-Registered Users */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Inscription TrimConnect
            </DialogTitle>
          </DialogHeader>
          
          {registrationStep === 1 && (
            <div className="space-y-6 mt-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-bold text-center mb-2">Frais de participation</h3>
                <p className="text-slate-400 text-center text-sm mb-4">
                  Pour participer au concours TrimConnect, des frais d'inscription uniques sont requis.
                </p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-amber-400">{PARTICIPATION_FEE} EUR</span>
                  <p className="text-slate-500 text-xs mt-1">Paiement unique - Accès à toutes les éditions</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Participation illimitée aux concours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Visibilité auprès de milliers de clients</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Chance de gagner des prix exclusifs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Badge "Participant TrimConnect" sur votre profil</span>
                </div>
              </div>

              <Button 
                onClick={handlePayParticipationFee}
                disabled={processingPayment}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-6"
                data-testid="pay-fee-btn"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-900 mr-2"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payer {PARTICIPATION_FEE} EUR
                  </>
                )}
              </Button>

              <p className="text-slate-500 text-xs text-center">
                Paiement sécurisé par Stripe. Vous serez redirigé pour finaliser le paiement.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Entry Dialog for Registered Salons */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Soumettre une participation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {isRegisteredSalon && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Salon inscrit - Participation gratuite</span>
              </div>
            )}
            <Input
              placeholder="Titre de votre création"
              value={newEntry.title}
              onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="entry-title-input"
            />
            <Textarea
              placeholder="Description (optionnel)"
              value={newEntry.description}
              onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="entry-description-input"
            />
            <Input
              placeholder="URL de l'image"
              value={newEntry.image_url}
              onChange={(e) => setNewEntry({...newEntry, image_url: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
              data-testid="entry-image-input"
            />
            <p className="text-slate-500 text-sm">
              Uploadez votre image sur un service externe et collez l'URL ici.
            </p>
            <Button 
              onClick={submitEntry}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
              data-testid="submit-entry-confirm-btn"
            >
              Soumettre ma participation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </a>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs defaultValue="entries" className="space-y-8">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="entries" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-slate-900">
              Participations
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-slate-900">
              Classement
            </TabsTrigger>
            <TabsTrigger value="hall-of-fame" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-slate-900">
              Hall of Fame
            </TabsTrigger>
          </TabsList>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Aucune participation</h3>
                <p className="text-slate-400 mb-4">Soyez le premier à participer !</p>
                <Button 
                  onClick={handleParticipate}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  Participer
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.entry_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="battle-card bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors"
                    data-testid={`entry-card-${entry.entry_id}`}
                  >
                    <div className="h-64 bg-slate-700 relative">
                      <img 
                        src={entry.image_url}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                      {entry.status === "finalist" && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Medal className="h-3 w-3" />
                          Finaliste
                        </div>
                      )}
                      {entry.status === "winner" && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <img 
                            src={CROWN_LOGO_URL} 
                            alt="Winner Crown" 
                            className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                          />
                          <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                            Gagnant
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-white mb-1">{entry.title}</h3>
                      <p className="text-slate-400 text-sm mb-2">par {entry.barber_name}</p>
                      {entry.salon_name && (
                        <p className="text-slate-500 text-xs mb-4">{entry.salon_name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-500">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="font-bold">{entry.votes}</span>
                          <span className="text-slate-500 text-sm">votes</span>
                        </div>
                        <Button
                          onClick={() => vote(entry.entry_id)}
                          variant={hasVoted(entry.entry_id) ? "default" : "outline"}
                          className={hasVoted(entry.entry_id) 
                            ? "bg-amber-500 text-slate-900 hover:bg-amber-600" 
                            : "border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                          }
                          data-testid={`vote-btn-${entry.entry_id}`}
                        >
                          <ThumbsUp className={`h-4 w-4 mr-2 ${hasVoted(entry.entry_id) ? 'fill-current' : ''}`} />
                          {hasVoted(entry.entry_id) ? 'Voté' : 'Voter'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" id="leaderboard" className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Classement actuel
                </h2>
              </div>
              {leaderboard.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400">Aucune participation pour le moment</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div 
                      key={entry.entry_id}
                      className={`flex items-center gap-4 p-4 ${index < 3 ? 'bg-amber-500/5' : ''}`}
                      data-testid={`leaderboard-row-${index}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold relative ${
                        index === 0 ? 'bg-amber-500 text-slate-900' :
                        index === 1 ? 'bg-slate-400 text-slate-900' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {index === 0 && (
                          <>
                            <img 
                              src={CROWN_LOGO_URL} 
                              alt="Crown" 
                              className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                            />
                            <span className="text-xs">1</span>
                          </>
                        )}
                        {index !== 0 && (index + 1)}
                      </div>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700">
                        <img 
                          src={entry.image_url}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{entry.title}</h3>
                        <p className="text-slate-400 text-sm">{entry.barber_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-500 font-bold">{entry.votes}</div>
                        <div className="text-slate-500 text-xs">votes</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Hall of Fame Tab */}
          <TabsContent value="hall-of-fame" className="space-y-6">
            <div className="text-center mb-8">
              <img 
                src={CROWN_LOGO_URL} 
                alt="Crown" 
                className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              />
              <h2 className="text-2xl font-heading font-bold text-white">Hall of Fame</h2>
              <p className="text-slate-400">Les gagnants des éditions précédentes</p>
            </div>
            
            {hallOfFame.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400">Pas encore de gagnants. Soyez le premier !</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hallOfFame.map((winner) => (
                  <motion.div
                    key={winner.entry_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-800 border-2 border-amber-500/30 rounded-xl overflow-hidden"
                    style={{ boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)' }}
                  >
                    <div className="h-64 bg-slate-700 relative">
                      <img 
                        src={winner.image_url}
                        alt={winner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <img 
                          src={CROWN_LOGO_URL} 
                          alt="Winner Crown" 
                          className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                        />
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                          {winner.contest_edition}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <img 
                        src={CROWN_LOGO_URL} 
                        alt="Winner Crown" 
                        className="w-12 h-12 mx-auto mb-2 drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                      />
                      <h3 className="font-heading font-bold text-white mb-1">{winner.title}</h3>
                      <p className="text-amber-400">{winner.barber_name}</p>
                      {winner.salon_name && (
                        <p className="text-slate-500 text-sm">{winner.salon_name}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TrimConnect;
