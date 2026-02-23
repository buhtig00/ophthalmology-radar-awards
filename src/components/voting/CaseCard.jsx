import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Hospital, MapPin, TrendingUp, CheckCircle2, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CaseCard({ caseItem, hasVoted, isSelected, onVote, disabled, showVoteCount }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [realTimeVotes, setRealTimeVotes] = useState(caseItem.vote_count || 0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Real-time vote count subscription
  useEffect(() => {
    if (!caseItem.id) return;
    
    const unsubscribe = base44.entities.Case.subscribe((event) => {
      if (event.id === caseItem.id && event.type === 'update' && event.data.vote_count !== undefined) {
        setRealTimeVotes(event.data.vote_count);
      }
    });

    return unsubscribe;
  }, [caseItem.id]);

  const { data: myFavorites = [] } = useQuery({
    queryKey: ["myFavorites"],
    queryFn: () => user ? base44.entities.Favorite.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  const isFavorited = myFavorites.some(f => f.case_id === caseItem.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        const fav = myFavorites.find(f => f.case_id === caseItem.id);
        await base44.entities.Favorite.delete(fav.id);
      } else {
        await base44.entities.Favorite.create({
          case_id: caseItem.id,
          case_title: caseItem.title,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
      toast.success(isFavorited ? "Eliminado de favoritos" : "Añadido a favoritos");
    },
  });

  const handleFavoriteClick = (e) => {
    e.preventDefault();
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
      className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden hover:border-[#C9A227]/30 transition-all group"
    >
      {/* Video Preview */}
      {caseItem.video_url && (
        <div className="aspect-video bg-gradient-to-br from-[#C9A227]/10 to-transparent relative overflow-hidden">
          <Video className="absolute inset-0 m-auto w-12 h-12 text-[#C9A227]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          {showVoteCount && (
            <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl border-[#C9A227]/30 text-[#C9A227] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {realTimeVotes}
            </Badge>
          )}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-black/80 transition-all group/fav"
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/fav:text-red-400'}`} />
          </button>
        </div>
      )}

      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#C9A227] transition-colors">
          {caseItem.title}
        </h3>

        {/* Category */}
        {caseItem.category_name && (
          <Badge variant="outline" className="mb-3 border-[#C9A227]/30 text-[#C9A227]">
            {caseItem.category_name}
          </Badge>
        )}

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-400">
          {caseItem.hospital && (
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-[#C9A227]" />
              <span className="line-clamp-1">{caseItem.hospital}</span>
            </div>
          )}
          {caseItem.country && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A227]" />
              <span>{caseItem.country}</span>
            </div>
          )}
        </div>

        {/* Description preview */}
        {caseItem.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {caseItem.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`${createPageUrl("CaseDetail")}?id=${caseItem.id}`} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-white/10 text-gray-300 hover:bg-white/5"
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver detalles
            </Button>
          </Link>
          
          {isSelected ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 flex-1 justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
              <span className="text-sm font-medium text-[#C9A227]">Votado</span>
            </div>
          ) : hasVoted ? (
            <Button
              size="sm"
              disabled
              className="flex-1 bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              Ya votaste
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onVote(caseItem)}
              disabled={disabled}
              className="flex-1 bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
            >
              Votar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}