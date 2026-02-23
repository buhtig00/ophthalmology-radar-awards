import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Award, Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CaseCard from "@/components/voting/CaseCard";
import VoteConfirmationDialog from "@/components/voting/VoteConfirmationDialog";
import { toast } from "sonner";
import { format, isAfter, isBefore } from "date-fns";

export default function Voting() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [confirmingVote, setConfirmingVote] = useState(null);
  const [showVoteCounts, setShowVoteCounts] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) setSelectedCategory(params.get("category"));
  }, []);

  const { data: eventConfig } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: async () => {
      const configs = await base44.entities.EventConfig.list();
      return configs[0];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["finalistCases"],
    queryFn: () => base44.entities.Case.filter({ status: "finalist" }),
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["myVotes"],
    queryFn: () => user ? base44.entities.Vote.filter({ created_by: user.email }) : [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Check voting period
  const isVotingOpen = () => {
    if (!eventConfig) return true;
    
    const now = new Date();
    const votingStart = eventConfig.voting_start ? new Date(eventConfig.voting_start) : null;
    const votingEnd = eventConfig.voting_end ? new Date(eventConfig.voting_end) : null;

    if (votingStart && isBefore(now, votingStart)) {
      return { open: false, reason: "not_started", date: votingStart };
    }
    
    if (votingEnd && isAfter(now, votingEnd)) {
      return { open: false, reason: "ended", date: votingEnd };
    }

    if (eventConfig.voting_open === false) {
      return { open: false, reason: "disabled" };
    }

    return { open: true };
  };

  const votingStatus = isVotingOpen();

  const voteMutation = useMutation({
    mutationFn: async (caseItem) => {
      // Rate limiting check - max 1 vote per category
      const existingVote = myVotes.find(v => v.category_id === caseItem.category_id);
      if (existingVote) {
        throw new Error("Ya has votado en esta categoría");
      }

      // Create vote with anti-fraud data
      await base44.entities.Vote.create({
        case_id: caseItem.id,
        category_id: caseItem.category_id,
        case_title: caseItem.title,
        category_name: caseItem.category_name,
        voter_ip: "tracked_by_backend",
        user_agent: navigator.userAgent,
      });

      // Update vote count
      await base44.entities.Case.update(caseItem.id, {
        vote_count: (caseItem.vote_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVotes"] });
      queryClient.invalidateQueries({ queryKey: ["finalistCases"] });
      setConfirmingVote(null);
      toast.success("¡Voto registrado correctamente!");
    },
    onError: (error) => {
      setConfirmingVote(null);
      toast.error(error.message || "Error al votar. Inténtalo de nuevo.");
    },
  });

  const handleVote = (caseItem) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!votingStatus.open) {
      if (votingStatus.reason === "not_started") {
        toast.error(`La votación abrirá el ${format(votingStatus.date, "d 'de' MMMM 'a las' HH:mm")}`);
      } else if (votingStatus.reason === "ended") {
        toast.error(`La votación cerró el ${format(votingStatus.date, "d 'de' MMMM")}`);
      } else {
        toast.error("La votación está cerrada temporalmente");
      }
      return;
    }

    setConfirmingVote(caseItem);
  };

  const confirmVote = () => {
    if (confirmingVote) {
      voteMutation.mutate(confirmingVote);
    }
  };

  const filteredCases = cases.filter(c => c.category_id === selectedCategory);
  const votedCategoryIds = myVotes.map(v => v.category_id);
  const myVotedCaseIds = myVotes.map(v => v.case_id);

  // Voting status banner
  const renderVotingBanner = () => {
    if (!eventConfig) return null;

    if (!votingStatus.open) {
      return (
        <div className="mb-6 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 font-semibold mb-1">Votación cerrada</p>
            {votingStatus.reason === "not_started" && (
              <p className="text-sm text-gray-400">
                La votación abrirá el {format(votingStatus.date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm")}
              </p>
            )}
            {votingStatus.reason === "ended" && (
              <p className="text-sm text-gray-400">
                La votación cerró el {format(votingStatus.date, "d 'de' MMMM 'de' yyyy")}
              </p>
            )}
            {votingStatus.reason === "disabled" && (
              <p className="text-sm text-gray-400">
                La votación está temporalmente deshabilitada por los administradores
              </p>
            )}
          </div>
        </div>
      );
    }

    if (eventConfig.voting_end) {
      const endDate = new Date(eventConfig.voting_end);
      return (
        <div className="mb-6 p-4 rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#C9A227] font-semibold mb-1">Votación abierta</p>
            <p className="text-sm text-gray-400">
              Cierra el {format(endDate, "d 'de' MMMM 'de' yyyy 'a las' HH:mm")}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-[#C9A227]" />
            <h1 className="text-3xl font-bold text-white">Votación Pública</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVoteCounts(!showVoteCounts)}
            className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
          >
            {showVoteCounts ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Ocultar votos</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Mostrar votos</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-400">Vota por el mejor caso clínico en cada categoría. Solo un voto por categoría.</p>
      </div>

      {renderVotingBanner()}

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[#C9A227] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.name}
              {votedCategoryIds.includes(cat.id) && " ✓"}
            </button>
          ))}
        </div>
      </div>

      {/* Cases */}
      {casesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hay casos finalistas en esta categoría aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              hasVoted={votedCategoryIds.includes(caseItem.category_id)}
              isSelected={myVotedCaseIds.includes(caseItem.id)}
              onVote={handleVote}
              disabled={voteMutation.isPending || !votingStatus.open}
              showVoteCount={showVoteCounts}
            />
          ))}
        </div>
      )}

      <VoteConfirmationDialog
        item={confirmingVote}
        isOpen={!!confirmingVote}
        onConfirm={confirmVote}
        onCancel={() => setConfirmingVote(null)}
        isProcessing={voteMutation.isPending}
      />
    </div>
  );
}