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
  Play
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

const TrimConnect = () => {
  const { user, login } = useAuth();
  const [entries, setEntries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, leaderboardRes, hofRes] = await Promise.all([
        axios.get(`${API}/trimconnect/entries?status=approved`),
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
      toast.success("Participation soumise avec succes !");
      setShowSubmitDialog(false);
      setNewEntry({ title: "", description: "", image_url: "" });
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la soumission");
    }
  };

  const vote = async (entryId) => {
    if (!user) {
      login();
      return;
    }

    try {
      await axios.post(`${API}/trimconnect/vote`, { entry_id: entryId }, { withCredentials: true });
      toast.success("Vote enregistre !");
      fetchData();
    } catch (error) {
      if (error.response?.data?.detail === "Already voted for this entry") {
        toast.error("Vous avez deja vote pour cette participation");
      } else {
        toast.error("Erreur lors du vote");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-indigo-500" />
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
                  <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" data-testid="submit-entry-btn">
                        Participer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          Soumettre une participation
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <Input
                          placeholder="Titre de votre creation"
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
                </>
              ) : (
                <Button onClick={login} className="bg-indigo-600 hover:bg-indigo-700" data-testid="login-btn">
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
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
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
              TrimConnect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Barber Battle
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Le plus grand concours de coiffure afro. Montrez votre talent, 
              gagnez des prix exceptionnels et rejoignez le Hall of Fame.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user && (
                <Button 
                  onClick={login}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold uppercase tracking-wider py-6 px-8 rounded-xl"
                  style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
                  data-testid="join-now-btn"
                >
                  Participer maintenant
                </Button>
              )}
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

      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </a>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs defaultValue="entries" className="space-y-8">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="entries" className="data-[state=active]:bg-indigo-600">
              Participations
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-indigo-600">
              Classement
            </TabsTrigger>
            <TabsTrigger value="hall-of-fame" className="data-[state=active]:bg-indigo-600">
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
                <p className="text-slate-400 mb-4">Soyez le premier a participer !</p>
                {user && (
                  <Button 
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    Participer
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.entry_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="battle-card bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
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
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Gagnant
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
                          variant="outline"
                          className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                          data-testid={`vote-btn-${entry.entry_id}`}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Voter
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-amber-500 text-slate-900' :
                        index === 1 ? 'bg-slate-400 text-slate-900' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {index === 0 && <Crown className="h-4 w-4" />}
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
              <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold text-white">Hall of Fame</h2>
              <p className="text-slate-400">Les gagnants des editions precedentes</p>
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
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {winner.contest_edition}
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <Crown className="h-6 w-6 text-amber-500 mx-auto mb-2" />
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
