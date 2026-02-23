import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Award, Building2, MapPin, Stethoscope, TrendingUp, 
  Loader2, CheckCircle2, Vote as VoteIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import VoteConfirmationDialog from "@/components/voting/VoteConfirmationDialog";

export default function FinalistDetail() {
  const queryClient = useQueryClient();
  const [finalistId, setFinalistId] = useState(null);
  const [user, setUser] = useState(null);
  const [confirmingVote, setConfirmingVote] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    setFinalistId(params.get("id"));
  }, []);

  const { data: finalist, isLoading: finalistLoading } = useQuery({
    queryKey: ["finalist", finalistId],
    queryFn: async () => {
      const finalists = await base44.entities.Finalist.list();
      return finalists.find(f => f.id === finalistId);
    },
    enabled: !!finalistId,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["myVotes"],
    queryFn: () => user ? base44.entities.Vote.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  const { data: category } = useQuery({
    queryKey: ["category", finalist?.category_id],
    queryFn: async () => {
      const categories = await base44.entities.Category.list();
      return categories.find(c => c.id === finalist.category_id);
    },
    enabled: !!finalist?.category_id,
  });

  const voteMutation = useMutation({
    mutationFn: async (finalist) => {
      await base44.entities.Vote.create({
        finalist_id: finalist.id,
        category_id: finalist.category_id,
        finalist_name: finalist.name,
        category_name: finalist.category_name,
      });
      await base44.entities.Finalist.update(finalist.id, {
        vote_count: (finalist.vote_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVotes"] });
      queryClient.invalidateQueries({ queryKey: ["finalist", finalistId] });
      queryClient.invalidateQueries({ queryKey: ["finalists"] });
      setConfirmingVote(null);
      toast.success("¡Voto registrado correctamente!");
    },
    onError: () => {
      setConfirmingVote(null);
      toast.error("Error al votar. Inténtalo de nuevo.");
    },
  });

  const handleVote = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setConfirmingVote(finalist);
  };

  const confirmVote = () => {
    if (confirmingVote) {
      voteMutation.mutate(confirmingVote);
    }
  };

  if (finalistLoading || !finalistId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!finalist) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto text-center py-20">
        <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Finalista no encontrado</h2>
        <Link to={createPageUrl("Voting")}>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 mt-4">
            Volver a votación
          </Button>
        </Link>
      </div>
    );
  }

  const votedCategoryIds = myVotes.map(v => v.category_id);
  const myVotedFinalistIds = myVotes.map(v => v.finalist_id);
  const hasVotedInCategory = votedCategoryIds.includes(finalist.category_id);
  const hasVotedForThis = myVotedFinalistIds.includes(finalist.id);

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <Link to={createPageUrl("Voting")}>
        <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a votación
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header with Photo */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="relative">
              <img
                src={finalist.photo_url || `https://ui-avatars.com/api/?name=${finalist.name}&background=c9a84c&color=0a0e1a&size=200`}
                alt={finalist.name}
                className="w-40 h-40 rounded-2xl object-cover border-2 border-[#c9a84c]/20"
              />
              {hasVotedForThis && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#c9a84c] rounded-full flex items-center justify-center border-4 border-[#0a0e1a]">
                  <CheckCircle2 className="w-5 h-5 text-[#0a0e1a]" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{finalist.name}</h1>
                  <p className="text-[#c9a84c] text-lg font-medium">{finalist.specialty}</p>
                </div>
                <Badge variant="outline" className="bg-[#c9a84c]/10 border-[#c9a84c]/20 text-[#c9a84c] flex items-center gap-2 px-4 py-2 text-base">
                  <TrendingUp className="w-4 h-4" />
                  {finalist.vote_count || 0} votos
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {finalist.hospital && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#c9a84c]" />
                    <div>
                      <p className="text-gray-500 text-xs">Hospital</p>
                      <p className="text-white font-medium">{finalist.hospital}</p>
                    </div>
                  </div>
                )}
                {finalist.country && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#c9a84c]" />
                    <div>
                      <p className="text-gray-500 text-xs">País</p>
                      <p className="text-white font-medium">{finalist.country}</p>
                    </div>
                  </div>
                )}
                {category && (
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#c9a84c]" />
                    <div>
                      <p className="text-gray-500 text-xs">Categoría</p>
                      <p className="text-white font-medium">{category.name}</p>
                    </div>
                  </div>
                )}
                {finalist.specialty && (
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-[#c9a84c]" />
                    <div>
                      <p className="text-gray-500 text-xs">Especialidad</p>
                      <p className="text-white font-medium">{finalist.specialty}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Vote Button */}
              {hasVotedForThis ? (
                <div className="flex items-center gap-2 text-[#c9a84c] font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Has votado por este finalista
                </div>
              ) : hasVotedInCategory ? (
                <Button disabled variant="outline" className="border-white/10 text-gray-500">
                  Ya votaste en esta categoría
                </Button>
              ) : (
                <Button
                  onClick={handleVote}
                  disabled={voteMutation.isPending}
                  className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
                >
                  <VoteIcon className="w-4 h-4 mr-2" />
                  Votar por este finalista
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Biography */}
        {finalist.bio && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
            <h2 className="text-white font-semibold text-xl mb-4">Biografía</h2>
            <p className="text-gray-300 text-lg leading-relaxed">{finalist.bio}</p>
          </div>
        )}
      </motion.div>

      <VoteConfirmationDialog
        finalist={confirmingVote}
        isOpen={!!confirmingVote}
        onConfirm={confirmVote}
        onCancel={() => setConfirmingVote(null)}
        isProcessing={voteMutation.isPending}
      />
    </div>
  );
}