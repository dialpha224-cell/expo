import { useState, useEffect } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Gift, 
  QrCode, 
  Check, 
  Star,
  Trophy,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const LoyaltyCard = ({ salonId, salonName }) => {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (user && salonId) {
      fetchCard();
      fetchRewards();
    }
  }, [user, salonId]);

  const fetchCard = async () => {
    try {
      const response = await axios.get(`${API}/loyalty/card/${salonId}`, { withCredentials: true });
      setCard(response.data);
    } catch (error) {
      console.log("Error fetching loyalty card");
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/loyalty/rewards`, { withCredentials: true });
      setRewards(response.data.filter(r => r.salon_id === salonId && !r.is_redeemed));
    } catch (error) {
      console.log("Error fetching rewards");
    }
  };

  if (!user || loading) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Carte Fidelite</h3>
            <p className="text-indigo-200 text-sm">{salonName || card?.salon_name}</p>
          </div>
        </div>
        <Button
          onClick={() => setShowQR(true)}
          className="bg-white/20 hover:bg-white/30 text-white"
          data-testid="show-qr-btn"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Mon QR
        </Button>
      </div>

      {/* Progress Stamps */}
      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-indigo-200">Progression</span>
          <span className="font-bold">{card?.stamps || 0} / {card?.max_stamps || 10}</span>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: card?.max_stamps || 10 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`aspect-square rounded-lg flex items-center justify-center ${
                index < (card?.stamps || 0)
                  ? "bg-amber-400 text-slate-900"
                  : "bg-white/10"
              }`}
              data-testid={`stamp-${index}`}
            >
              {index < (card?.stamps || 0) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs text-white/40">{index + 1}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reward Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white/10 rounded-full h-2">
          <motion.div 
            className="bg-amber-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((card?.stamps || 0) / (card?.max_stamps || 10)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs">{card?.rewards_earned || 0} recompenses</span>
        </div>
      </div>

      {/* Pending Rewards */}
      {rewards.length > 0 && (
        <div className="mt-4 bg-amber-400/20 border border-amber-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-amber-300">Recompense disponible !</span>
          </div>
          {rewards.map((reward) => (
            <div key={reward.reward_id} className="flex items-center justify-between">
              <span className="text-sm">{reward.reward_description}</span>
              <ChevronRight className="w-4 h-4 text-amber-300" />
            </div>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Votre QR Code Fidelite</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {card?.qr_code && (
              <img 
                src={card.qr_code} 
                alt="QR Code Fidelite"
                className="w-64 h-64 rounded-xl bg-white p-2"
                data-testid="loyalty-qr-code"
              />
            )}
            <p className="text-slate-400 text-center mt-4 text-sm">
              Presentez ce QR code au salon apres votre coupe pour obtenir un tampon.
            </p>
            <p className="text-indigo-400 text-center mt-2 font-medium">
              {card?.stamps || 0} / {card?.max_stamps || 10} tampons
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyCard;
