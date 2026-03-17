import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { 
  Crown, 
  Check, 
  Sparkles, 
  Scissors, 
  Gift,
  Calendar,
  Star,
  Zap
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";

const SubscriptionPlans = ({ onSubscribe }) => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/plans`);
      setPlans(response.data);
    } catch (error) {
      console.log("Error fetching plans:", error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/my`, { withCredentials: true });
      setCurrentSubscription(response.data);
    } catch (error) {
      console.log("No active subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const response = await axios.post(
        `${API}/subscriptions/subscribe?plan_id=${planId}`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setCurrentSubscription(response.data.subscription);
      if (onSubscribe) onSubscribe(response.data.subscription);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'abonnement");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) return;
    
    try {
      await axios.post(`${API}/subscriptions/cancel`, {}, { withCredentials: true });
      toast.success("Abonnement annulé");
      setCurrentSubscription(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  const planIcons = {
    basic: Scissors,
    standard: Star,
    premium: Crown
  };

  const planColors = {
    basic: "from-slate-600 to-slate-700",
    standard: "from-indigo-600 to-purple-600",
    premium: "from-amber-500 to-orange-500"
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="subscription-plans">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Abonnements Mensuels</h2>
        <p className="text-slate-400">Économisez avec nos forfaits coupes illimitées</p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-green-300 text-sm">Abonnement actif</p>
                <p className="text-white font-bold text-lg">
                  {currentSubscription.plan?.name || currentSubscription.plan_id}
                </p>
                <p className="text-slate-400 text-sm">
                  {currentSubscription.cuts_remaining === -1 
                    ? "Coupes illimitées"
                    : `${currentSubscription.cuts_remaining} coupe(s) restante(s) ce mois`
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.plan_id] || Scissors;
          const isCurrentPlan = currentSubscription?.plan_id === plan.plan_id;
          const isPremium = plan.plan_id === "premium";

          return (
            <div
              key={plan.plan_id}
              className={`relative rounded-2xl overflow-hidden ${
                isPremium ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              {isPremium && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-center py-1 text-xs font-bold text-slate-900">
                  POPULAIRE
                </div>
              )}
              
              <div className={`bg-gradient-to-br ${planColors[plan.plan_id]} p-6 ${isPremium ? 'pt-8' : ''}`}>
                <Icon className="h-10 w-10 text-white/80 mb-4" />
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-white/70 text-sm mt-1">{plan.description}</p>
              </div>

              <div className="bg-slate-800 p-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-400">/mois</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.plan_id)}
                  disabled={isCurrentPlan || subscribing === plan.plan_id}
                  className={`w-full ${
                    isPremium 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {subscribing === plan.plan_id ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Traitement...
                    </span>
                  ) : isCurrentPlan ? (
                    "Abonnement actuel"
                  ) : (
                    "S'abonner"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mt-12 bg-slate-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-amber-400" />
          Avantages abonnés
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <Zap className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-white font-medium">Réservation prioritaire</p>
            <p className="text-slate-500 text-xs">Créneaux réservés</p>
          </div>
          <div className="text-center p-4">
            <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-medium">+200 points bonus</p>
            <p className="text-slate-500 text-xs">À l'inscription</p>
          </div>
          <div className="text-center p-4">
            <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Sans engagement</p>
            <p className="text-slate-500 text-xs">Annulez quand vous voulez</p>
          </div>
          <div className="text-center p-4">
            <Crown className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-white font-medium">Statut VIP</p>
            <p className="text-slate-500 text-xs">Progression accélérée</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
