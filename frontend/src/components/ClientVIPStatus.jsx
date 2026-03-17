import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { 
  Crown, 
  Star, 
  Gift, 
  TrendingUp, 
  Copy, 
  Check,
  Bell,
  BellOff,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Switch } from "./ui/switch";

const tierColors = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-500",
  platinum: "from-purple-400 to-indigo-600"
};

const tierIcons = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "👑"
};

const ClientVIPStatus = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    email_marketing: true,
    email_reminders: true,
    push_promotions: true,
    push_reminders: true,
    max_messages_per_week: 3
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/client/profile/enhanced`, { withCredentials: true });
      setProfile(response.data);
      if (response.data.notification_preferences) {
        setPreferences(response.data.notification_preferences);
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success("Code copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await axios.put(`${API}/client/notification-preferences`, preferences, { withCredentials: true });
      toast.success("Préférences mises à jour");
      setShowPreferences(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-24 bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (!profile) return null;

  const progressToNext = profile.next_tier 
    ? ((profile.lifetime_points - (profile.lifetime_points - profile.points_to_next_tier)) / profile.points_to_next_tier) * 100
    : 100;

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden" data-testid="vip-status-card">
        {/* VIP Header */}
        <div className={`bg-gradient-to-r ${tierColors[profile.vip_tier]} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tierIcons[profile.vip_tier]}</span>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-wider">Statut VIP</p>
                <p className="text-white font-bold text-lg capitalize">{profile.vip_tier}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Points</p>
              <p className="text-white font-bold text-2xl">{profile.total_points}</p>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {profile.next_tier && (
          <div className="px-4 py-3 bg-slate-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Prochain niveau : {profile.next_tier}</span>
              <span>{profile.points_to_next_tier} pts restants</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${tierColors[profile.next_tier]} transition-all duration-500`}
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Vos avantages</p>
          <div className="space-y-2">
            {profile.tier_benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
            {profile.discount_percent > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 font-semibold">-{profile.discount_percent}% sur toutes les coupes</span>
              </div>
            )}
          </div>
        </div>

        {/* Referral Code */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Code parrainage</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 font-mono text-amber-400">
              {profile.referral_code}
            </div>
            <Button
              onClick={copyReferralCode}
              variant="outline"
              size="sm"
              className="border-slate-600"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            Partagez et gagnez 100 pts pour chaque ami inscrit ! ({profile.referrals_count} parrainages)
          </p>
        </div>

        {/* Stats & Preferences */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white font-bold">{profile.total_bookings}</p>
              <p className="text-slate-500 text-xs">Réservations</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{profile.lifetime_points}</p>
              <p className="text-slate-500 text-xs">Points totaux</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPreferences(true)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Notification Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-400" />
              Préférences de notification
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-slate-400 text-sm">
              Contrôlez la fréquence et le type de messages que vous recevez.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">Rappels de rendez-vous</p>
                  <p className="text-slate-500 text-xs">Email avant chaque RDV</p>
                </div>
                <Switch
                  checked={preferences.email_reminders}
                  onCheckedChange={(val) => setPreferences({...preferences, email_reminders: val})}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">Promotions & offres</p>
                  <p className="text-slate-500 text-xs">Réductions exclusives</p>
                </div>
                <Switch
                  checked={preferences.email_marketing}
                  onCheckedChange={(val) => setPreferences({...preferences, email_marketing: val})}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">Notifications push</p>
                  <p className="text-slate-500 text-xs">Alertes sur mobile</p>
                </div>
                <Switch
                  checked={preferences.push_promotions}
                  onCheckedChange={(val) => setPreferences({...preferences, push_promotions: val})}
                />
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm">Max messages/semaine</p>
                  <span className="text-indigo-400 font-bold">{preferences.max_messages_per_week}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={preferences.max_messages_per_week}
                  onChange={(e) => setPreferences({...preferences, max_messages_per_week: parseInt(e.target.value)})}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>7</span>
                </div>
              </div>
            </div>

            <Button
              onClick={savePreferences}
              disabled={savingPrefs}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {savingPrefs ? "Enregistrement..." : "Enregistrer les préférences"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientVIPStatus;
