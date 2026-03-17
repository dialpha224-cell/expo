import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Trophy, TrendingUp, Users, Star, DollarSign } from "lucide-react";
import { toast } from "sonner";

const tierColors = {
  bronze: "border-amber-700 bg-amber-900/20 text-amber-400",
  silver: "border-slate-400 bg-slate-600/20 text-slate-300",
  gold: "border-yellow-400 bg-yellow-500/20 text-yellow-400",
  platinum: "border-purple-400 bg-purple-600/20 text-purple-300"
};

const criteriaIcons = {
  bookings: TrendingUp,
  revenue: DollarSign,
  rating: Star,
  retention: Users
};

const SalonBadges = ({ salonId }) => {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) {
      fetchBadges();
    }
  }, [salonId]);

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API}/salon/${salonId}/badges`);
      setBadgeData(response.data);
    } catch (error) {
      console.log("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-32 bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (!badgeData) return null;

  const { stats, earned_badges, all_badges } = badgeData;

  return (
    <div className="space-y-6" data-testid="salon-badges">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <TrendingUp className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total_bookings}</p>
          <p className="text-slate-400 text-xs">Réservations</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total_revenue}€</p>
          <p className="text-slate-400 text-xs">Revenus</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Star className="h-6 w-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.rating.toFixed(1)}</p>
          <p className="text-slate-400 text-xs">Note moyenne</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.retention_rate}%</p>
          <p className="text-slate-400 text-xs">Fidélisation</p>
        </div>
      </div>

      {/* Earned Badges */}
      {earned_badges.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Badges gagnés</h3>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              {earned_badges.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {earned_badges.map((badge) => (
              <div
                key={badge.badge_id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${tierColors[badge.tier]}`}
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="font-medium text-sm">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Badges Progress */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tous les badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {all_badges.map((badge) => {
            const Icon = criteriaIcons[badge.criteria_type] || Trophy;
            const progress = badge.criteria_type === "bookings" 
              ? Math.min((stats.total_bookings / badge.criteria_value) * 100, 100)
              : badge.criteria_type === "revenue"
              ? Math.min((stats.total_revenue / badge.criteria_value) * 100, 100)
              : badge.criteria_type === "rating"
              ? Math.min(((stats.rating * 10) / badge.criteria_value) * 100, 100)
              : Math.min((stats.retention_rate / badge.criteria_value) * 100, 100);

            return (
              <div
                key={badge.badge_id}
                className={`p-4 rounded-lg border ${
                  badge.earned 
                    ? tierColors[badge.tier]
                    : 'border-slate-700 bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${!badge.earned && 'opacity-40 grayscale'}`}>
                    {badge.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${badge.earned ? 'text-white' : 'text-slate-400'}`}>
                        {badge.name}
                      </p>
                      {badge.earned && (
                        <span className="text-green-400 text-xs">✓ Obtenu</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon className="h-3 w-3 text-slate-500" />
                      <span className="text-slate-500 text-xs">
                        {badge.criteria_type === "bookings" && `${stats.total_bookings}/${badge.criteria_value} réservations`}
                        {badge.criteria_type === "revenue" && `${stats.total_revenue}/${badge.criteria_value}€`}
                        {badge.criteria_type === "rating" && `${(stats.rating).toFixed(1)}/${(badge.criteria_value/10).toFixed(1)} étoiles`}
                        {badge.criteria_type === "retention" && `${stats.retention_rate}/${badge.criteria_value}% fidélisation`}
                      </span>
                    </div>
                    {!badge.earned && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalonBadges;
