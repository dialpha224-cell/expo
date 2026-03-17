import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  TrendingUp,
  Camera,
  Send,
  X,
  Plus,
  Award,
  RefreshCw,
  Home,
  ArrowLeft,
  Filter,
  Flame,
  Clock,
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Tendances = () => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [likedTrends, setLikedTrends] = useState([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('popular'); // 'popular', 'recent', 'salon'
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [salons, setSalons] = useState([]);
  const [newTrend, setNewTrend] = useState({
    title: '',
    description: '',
    message: '',
    image_url: ''
  });

  // Get unique salons from trends
  useEffect(() => {
    if (trends.length > 0) {
      const uniqueSalons = [...new Map(trends.map(t => [t.salon_name, { name: t.salon_name, id: t.author_salon_id }])).values()];
      setSalons(uniqueSalons);
    }
  }, [trends]);

  // Apply filters
  useEffect(() => {
    let sorted = [...trends];
    
    if (activeFilter === 'popular') {
      sorted.sort((a, b) => b.likes - a.likes);
    } else if (activeFilter === 'recent') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (activeFilter === 'salon' && selectedSalon) {
      sorted = sorted.filter(t => t.salon_name === selectedSalon);
    }
    
    setFilteredTrends(sorted);
  }, [trends, activeFilter, selectedSalon]);

  useEffect(() => {
    fetchUser();
    fetchTrends();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyLikes();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/trends?limit=30`);
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLikes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/trends/my-likes`, { withCredentials: true });
      setLikedTrends(response.data);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLike = async (trendId) => {
    if (!user) {
      toast.error("Connectez-vous pour aimer cette création");
      return;
    }

    const isLiked = likedTrends.includes(trendId);
    
    try {
      if (isLiked) {
        await axios.delete(`${API_URL}/api/trends/${trendId}/like`, { withCredentials: true });
        setLikedTrends(prev => prev.filter(id => id !== trendId));
        setTrends(prev => prev.map(t => 
          t.trend_id === trendId ? { ...t, likes: t.likes - 1 } : t
        ));
      } else {
        await axios.post(`${API_URL}/api/trends/${trendId}/like`, {}, { withCredentials: true });
        setLikedTrends(prev => [...prev, trendId]);
        setTrends(prev => prev.map(t => 
          t.trend_id === trendId ? { ...t, likes: t.likes + 1 } : t
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTrend.title || !newTrend.image_url) {
      toast.error("Titre et image requis");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/trends`, newTrend, { withCredentials: true });
      toast.success("Votre création a été soumise pour validation !");
      setShowSubmitDialog(false);
      setNewTrend({ title: '', description: '', message: '', image_url: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async (trend) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trend.title,
          text: `Découvrez cette création de ${trend.salon_name} sur AfroCrown !`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const refreshTrends = () => {
    fetchTrends();
    toast.success("Tendances actualisées !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6"
          >
            <TrendingUp className="h-4 w-4" />
            Espace créatif & interactif
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Tendances
            </span>
            <span className="text-white"> du Moment</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Découvrez les créations des meilleurs salons, likez vos préférées et partagez l'inspiration !
          </motion.p>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            <button
              onClick={() => { setActiveFilter('popular'); setSelectedSalon(null); }}
              data-testid="filter-popular"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'popular' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame className="h-4 w-4" />
              Populaires
            </button>
            <button
              onClick={() => { setActiveFilter('recent'); setSelectedSalon(null); }}
              data-testid="filter-recent"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'recent' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Clock className="h-4 w-4" />
              Récentes
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveFilter(activeFilter === 'salon' ? 'popular' : 'salon')}
                data-testid="filter-salon"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'salon' 
                    ? 'bg-amber-500 text-slate-900' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Store className="h-4 w-4" />
                Par salon
              </button>
              {activeFilter === 'salon' && (
                <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-xl p-2 min-w-[220px] max-h-[300px] overflow-y-auto z-50 shadow-xl">
                  <button
                    onClick={() => setSelectedSalon(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      !selectedSalon ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Tous les salons
                  </button>
                  {salons.map((salon) => (
                    <button
                      key={salon.name}
                      onClick={() => setSelectedSalon(salon.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedSalon === salon.name ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {salon.name}
                    </button>
                  ))}
                </div>
              )}}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button 
              onClick={() => navigate('/')}
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              data-testid="back-home-btn"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            
            <Button 
              onClick={refreshTrends}
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            {user && (user.role === 'salon_owner' || user.role === 'founder') && (
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900">
                    <Plus className="h-4 w-4 mr-2" />
                    Soumettre une création
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Camera className="h-5 w-5 text-amber-500" />
                      Soumettre une création
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Titre de la création *</label>
                      <Input
                        value={newTrend.title}
                        onChange={(e) => setNewTrend({ ...newTrend, title: e.target.value })}
                        placeholder="Ex: Dégradé artistique"
                        className="bg-slate-800 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">URL de l'image *</label>
                      <Input
                        value={newTrend.image_url}
                        onChange={(e) => setNewTrend({ ...newTrend, image_url: e.target.value })}
                        placeholder="https://..."
                        className="bg-slate-800 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Description</label>
                      <Input
                        value={newTrend.description}
                        onChange={(e) => setNewTrend({ ...newTrend, description: e.target.value })}
                        placeholder="Décrivez votre création..."
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Votre message</label>
                      <Textarea
                        value={newTrend.message}
                        onChange={(e) => setNewTrend({ ...newTrend, message: e.target.value })}
                        placeholder="Un petit mot pour la communauté..."
                        className="bg-slate-800 border-slate-700 text-white"
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                    >
                      {submitting ? 'Envoi...' : 'Soumettre'}
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Active filter indicator */}
        {activeFilter === 'salon' && selectedSalon && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-slate-400 text-sm">Filtré par:</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
              {selectedSalon}
            </span>
            <button 
              onClick={() => setSelectedSalon(null)}
              className="text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredTrends.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune tendance pour le moment</h3>
            <p className="text-slate-400">
              {selectedSalon ? `Aucune création de ${selectedSalon}` : 'Les salons n\'ont pas encore soumis de créations.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTrends.map((trend, index) => (
                <motion.div
                  key={trend.trend_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={trend.image_url} 
                      alt={trend.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {trend.is_featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 bg-amber-500 rounded-full text-slate-900 text-xs font-bold">
                        <Award className="h-3 w-3" />
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-white text-lg mb-1 line-clamp-1">
                      {trend.title}
                    </h3>
                    <p className="text-amber-400 text-sm font-medium mb-2">
                      {trend.salon_name}
                    </p>
                    
                    {trend.message && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2 italic">
                        "{trend.message}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handleLike(trend.trend_id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                          likedTrends.includes(trend.trend_id)
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-red-500/10 hover:text-red-400'
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 ${likedTrends.includes(trend.trend_id) ? 'fill-current' : ''}`} 
                        />
                        <span className="text-sm font-medium">{trend.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(trend)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">Partager</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tendances;
