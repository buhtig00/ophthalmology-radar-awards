import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Vote, Award, Loader2, Calendar, CheckCircle2, Eye } from "lucide-react";
import { format } from "date-fns";

export default function VotingHistory({ user }) {
  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["userVotes", user.email],
    queryFn: () => base44.entities.Vote.filter({ created_by: user.email }, "-created_date"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: finalists = [] } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
        <Vote className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-1">Aún no has votado</p>
        <p className="text-gray-600 text-sm">Tus votos aparecerán aquí</p>
      </div>
    );
  }

  const votedCategoryIds = votes.map(v => v.category_id);
  const totalCategories = categories.length;
  const completionPercent = totalCategories > 0 ? Math.round((votedCategoryIds.length / totalCategories) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-lg">Progreso de Votación</h3>
            <p className="text-gray-400 text-sm">
              {votedCategoryIds.length} de {totalCategories} categorías completadas
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c9a84c]">{completionPercent}%</div>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8d48b] rounded-full"
          />
        </div>
      </div>

      {/* Votes List */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#c9a84c]" />
          Tus Votos
        </h3>
        {votes.map((vote, i) => {
          const finalist = finalists.find(f => f.id === vote.finalist_id);
          const category = categories.find(c => c.id === vote.category_id);
          
          return (
            <motion.div
              key={vote.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start gap-4">
                {finalist?.photo_url && (
                  <Link to={createPageUrl("FinalistDetail") + `?id=${vote.finalist_id}`}>
                    <img
                      src={finalist.photo_url}
                      alt={finalist.name}
                      className="w-12 h-12 rounded-lg object-cover hover:opacity-80 transition-opacity"
                    />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link to={createPageUrl("FinalistDetail") + `?id=${vote.finalist_id}`}>
                      <h4 className="text-white font-semibold hover:text-[#c9a84c] transition-colors">{vote.finalist_name || finalist?.name}</h4>
                    </Link>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {format(new Date(vote.created_date), "d MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 text-xs font-medium">
                      {vote.category_name || category?.name}
                    </span>
                    {finalist?.specialty && (
                      <span className="text-gray-500 text-xs">{finalist.specialty}</span>
                    )}
                  </div>
                  <Link to={createPageUrl("FinalistDetail") + `?id=${vote.finalist_id}`}>
                    <span className="inline-flex items-center gap-1 text-[#c9a84c] text-xs hover:underline">
                      <Eye className="w-3 h-3" />
                      Ver perfil completo
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Remaining Categories */}
      {votedCategoryIds.length < totalCategories && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-400 text-sm mb-2">
            <Award className="w-4 h-4 inline mr-1" />
            Categorías pendientes de votar:
          </p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(cat => !votedCategoryIds.includes(cat.id))
              .map(cat => (
                <span
                  key={cat.id}
                  className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs border border-white/10"
                >
                  {cat.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}