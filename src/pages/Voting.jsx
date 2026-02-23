import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Award, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FinalistCard from "@/components/voting/FinalistCard";
import VoteConfirmationDialog from "@/components/voting/VoteConfirmationDialog";
import { toast } from "sonner";

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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: finalists = [], isLoading: finalistsLoading } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.filter({ is_active: true }),
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

  const voteMutation = useMutation({
    mutationFn: async (finalist) => {
      await base44.entities.Vote.create({
        finalist_id: finalist.id,
        category_id: finalist.category_id,
        finalist_name: finalist.name,
        category_name: finalist.category_name,
      });
      // Update vote count
      await base44.entities.Finalist.update(finalist.id, {
        vote_count: (finalist.vote_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVotes"] });
      queryClient.invalidateQueries({ queryKey: ["finalists"] });
      setConfirmingVote(null);
      toast.success("¡Voto registrado correctamente!");
    },
    onError: () => {
      setConfirmingVote(null);
      toast.error("Error al votar. Inténtalo de nuevo.");
    },
  });

  const handleVote = (finalist) => {
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

  const filteredFinalists = finalists.filter(f => f.category_id === selectedCategory);
  const votedCategoryIds = myVotes.map(v => v.category_id);
  const myVotedFinalistIds = myVotes.map(v => v.finalist_id);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-[#c9a84c]" />
            <h1 className="text-3xl font-bold text-white">Votar</h1>
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
        <p className="text-gray-400">Selecciona una categoría y vota por tu favorito. Un voto por categoría.</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[#c9a84c] text-[#0a0e1a]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.name}
              {votedCategoryIds.includes(cat.id) && " ✓"}
            </button>
          ))}
        </div>
      </div>

      {/* Finalists */}
      {finalistsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
        </div>
      ) : filteredFinalists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No hay finalistas en esta categoría aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFinalists.map((finalist) => (
            <FinalistCard
              key={finalist.id}
              finalist={finalist}
              hasVoted={votedCategoryIds.includes(finalist.category_id)}
              isSelected={myVotedFinalistIds.includes(finalist.id)}
              onVote={handleVote}
              disabled={voteMutation.isPending}
              showVoteCount={showVoteCounts}
            />
          ))}
        </div>
      )}

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