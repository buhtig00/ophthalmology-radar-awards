import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Building2, TrendingUp, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function FinalistCard({ finalist, hasVoted, isSelected, onVote, disabled, showVoteCount = false }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [realTimeVotes, setRealTimeVotes] = useState(finalist.vote_count || 0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Real-time vote count subscription
  useEffect(() => {
    if (!finalist.id) return;
    
    const unsubscribe = base44.entities.Finalist.subscribe((event) => {
      if (event.id === finalist.id && event.type === 'update' && event.data.vote_count !== undefined) {
        setRealTimeVotes(event.data.vote_count);
      }
    });

    return unsubscribe;
  }, [finalist.id]);

  const { data: myFavorites = [] } = useQuery({
    queryKey: ["myFavorites"],
    queryFn: () => user ? base44.entities.Favorite.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  const isFavorited = myFavorites.some(f => f.finalist_id === finalist.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        const fav = myFavorites.find(f => f.finalist_id === finalist.id);
        await base44.entities.Favorite.delete(fav.id);
      } else {
        await base44.entities.Favorite.create({
          finalist_id: finalist.id,
          finalist_name: finalist.name,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
      toast.success(isFavorited ? "Eliminado de favoritos" : "Añadido a favoritos");
    },
  });

  const handleFavoriteClick = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isSelected
          ? "border-[#c9a84c]/50 bg-[#c9a84c]/5 ring-1 ring-[#c9a84c]/20"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={finalist.photo_url || `https://ui-avatars.com/api/?name=${finalist.name}&background=c9a84c&color=0a0e1a&size=80`}
              alt={finalist.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#c9a84c] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-[#0a0e1a]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link to={createPageUrl("FinalistDetail") + `?id=${finalist.id}`}>
                <h3 className="text-white font-semibold text-lg hover:text-[#c9a84c] transition-colors">{finalist.name}</h3>
              </Link>
              <div className="flex items-center gap-2">
                {showVoteCount && (
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-[#c9a84c] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {realTimeVotes}
                  </Badge>
                )}
                <button
                  onClick={handleFavoriteClick}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-all"
                >
                  <Heart className={`w-4 h-4 transition-all ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                </button>
              </div>
            </div>
            <p className="text-[#c9a84c] text-sm font-medium">{finalist.specialty}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-500 text-xs">
              {finalist.hospital && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {finalist.hospital}
                </span>
              )}
              {finalist.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {finalist.country}
                </span>
              )}
            </div>
          </div>
        </div>
        {finalist.bio && (
          <p className="text-gray-400 text-sm mt-4 line-clamp-2">{finalist.bio}</p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Link to={createPageUrl("FinalistDetail") + `?id=${finalist.id}`}>
            <Button variant="outline" size="sm" className="w-full border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
              <Eye className="w-3.5 h-3.5 mr-2" />
              Ver perfil completo
            </Button>
          </Link>
          {isSelected ? (
            <div className="flex items-center gap-2 text-[#c9a84c] text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Tu voto en esta categoría
            </div>
          ) : hasVoted ? (
            <Button disabled size="sm" variant="outline" className="w-full border-white/10 text-gray-500">
              Ya votaste en esta categoría
            </Button>
          ) : (
            <Button
              onClick={() => onVote(finalist)}
              disabled={disabled}
              size="sm"
              className="w-full bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
            >
              Votar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}