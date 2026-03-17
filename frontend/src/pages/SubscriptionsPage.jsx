import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import SubscriptionPlans from "../components/SubscriptionPlans";
import { Button } from "../components/ui/button";
import { ArrowLeft, Crown } from "lucide-react";

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-[#FFD700]" />
                <span className="text-xl font-bold text-[#FFD700]">AfroCrown</span>
              </div>
            </div>
            {user && (
              <p className="text-slate-400 text-sm">
                Connecté en tant que <span className="text-white">{user.name}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user ? (
          <div className="text-center py-20">
            <Crown className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connexion requise</h2>
            <p className="text-slate-400 mb-6">Connectez-vous pour accéder aux abonnements</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#FFD700] hover:bg-[#FFA500] text-slate-900"
            >
              Se connecter
            </Button>
          </div>
        ) : (
          <SubscriptionPlans 
            onSubscribe={(sub) => {
              console.log("Subscribed:", sub);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default SubscriptionsPage;
