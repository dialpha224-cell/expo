import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import axios from "axios";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  Star, 
  X, 
  Send,
  Store,
  Scissors,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

// Star Rating Component
const StarRating = ({ rating, setRating, label, icon: Icon, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-5 w-5 text-indigo-400" />}
        <span className="text-white font-medium">{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && setRating(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            data-testid={`star-${label.toLowerCase().replace(/\s+/g, '-')}-${star}`}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-sm text-slate-400 mt-1">
          {rating === 1 && "Tres insatisfait"}
          {rating === 2 && "Insatisfait"}
          {rating === 3 && "Correct"}
          {rating === 4 && "Satisfait"}
          {rating === 5 && "Tres satisfait"}
        </p>
      )}
    </div>
  );
};

// Review Display Component
export const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4">
      <div className="flex items-start gap-4">
        <img
          src={review.user_picture || `https://ui-avatars.com/api/?name=${review.user_name}&background=4F46E5&color=fff`}
          alt={review.user_name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-white">{review.user_name}</h4>
              <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.salon_rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {review.haircut_name && (
            <p className="text-sm text-indigo-400 mb-2">
              {review.haircut_name} avec {review.barber_name}
            </p>
          )}
          
          {review.salon_comment && (
            <p className="text-slate-300 text-sm mb-2">
              "{review.salon_comment}"
            </p>
          )}
          
          {review.barber_comment && review.barber_comment !== review.salon_comment && (
            <p className="text-slate-400 text-sm italic">
              Sur le coiffeur: "{review.barber_comment}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Review Stats Component
export const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const distribution = stats.rating_distribution || {};
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-1">
            {stats.average_salon_rating || 0}
          </div>
          <div className="flex justify-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(stats.average_salon_rating || 0)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-400">{stats.total_reviews} avis</p>
        </div>
        
        {/* Rating Distribution */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400 w-3">{rating}</span>
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${(distribution[rating] || 0) / maxCount * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-6">{distribution[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Review Form Modal
const ReviewFormModal = ({ 
  isOpen, 
  onClose, 
  appointment,
  onSuccess 
}) => {
  const [salonRating, setSalonRating] = useState(0);
  const [barberRating, setBarberRating] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);
  const [salonComment, setSalonComment] = useState("");
  const [barberComment, setBarberComment] = useState("");
  const [platformComment, setPlatformComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (salonRating === 0 || barberRating === 0) {
      toast.error("Veuillez noter le salon et le coiffeur");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reviews`, {
        appointment_id: appointment.appointment_id,
        salon_rating: salonRating,
        barber_rating: barberRating,
        platform_rating: platformRating > 0 ? platformRating : null,
        salon_comment: salonComment || null,
        barber_comment: barberComment || null,
        platform_comment: platformComment || null
      }, { withCredentials: true });

      setSuccess(true);
      toast.success("Merci pour votre avis !");
      
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'envoi de l'avis");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          data-testid="review-modal"
        >
          {success ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                Merci pour votre avis !
              </h2>
              <p className="text-slate-400">
                Votre retour nous aide a ameliorer nos services.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h2 className="text-xl font-heading font-bold text-white">
                    Laisser un avis
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {appointment?.haircut_name} - {appointment?.salon_name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Salon Rating */}
                <StarRating
                  rating={salonRating}
                  setRating={setSalonRating}
                  label="Note du salon"
                  icon={Store}
                />
                <Textarea
                  placeholder="Votre commentaire sur le salon (optionnel)"
                  value={salonComment}
                  onChange={(e) => setSalonComment(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mb-6 resize-none"
                  rows={2}
                  data-testid="salon-comment"
                />

                {/* Barber Rating */}
                <StarRating
                  rating={barberRating}
                  setRating={setBarberRating}
                  label={`Note du coiffeur (${appointment?.barber_name || 'Coiffeur'})`}
                  icon={Scissors}
                />
                <Textarea
                  placeholder="Votre commentaire sur le coiffeur (optionnel)"
                  value={barberComment}
                  onChange={(e) => setBarberComment(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mb-6 resize-none"
                  rows={2}
                  data-testid="barber-comment"
                />

                {/* Platform Rating (Optional) */}
                <div className="border-t border-slate-700 pt-6">
                  <p className="text-sm text-slate-400 mb-4">
                    Notez egalement votre experience sur AfroCrown (optionnel)
                  </p>
                  <StarRating
                    rating={platformRating}
                    setRating={setPlatformRating}
                    label="Note AfroCrown"
                    icon={Sparkles}
                  />
                  {platformRating > 0 && (
                    <Textarea
                      placeholder="Comment ameliorer AfroCrown ? (optionnel)"
                      value={platformComment}
                      onChange={(e) => setPlatformComment(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mb-6 resize-none"
                      rows={2}
                      data-testid="platform-comment"
                    />
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || salonRating === 0 || barberRating === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  data-testid="submit-review"
                >
                  {loading ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer mon avis
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewFormModal;
