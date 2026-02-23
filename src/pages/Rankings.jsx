import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Loader2, Medal } from "lucide-react";

export default function Rankings() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: finalists = [], isLoading } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.filter({ is_active: true }),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: () => base44.entities.EventConfig.list(),
  });

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const config = configs[0];

  if (config && !config.show_rankings) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto text-center py-20">
        <Trophy className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Rankings no disponibles</h2>
        <p className="text-gray-500">Los rankings se mostrarán próximamente.</p>
      </div>
    );
  }

  const filteredFinalists = selectedCategory === "all"
    ? finalists
    : finalists.filter(f => f.category_id === selectedCategory);

  const sortedFinalists = [...filteredFinalists].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const maxVotes = sortedFinalists[0]?.vote_count || 1;

  const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7 text-[#c9a84c]" />
          <h1 className="text-3xl font-bold text-white">Rankings</h1>
        </div>
        <p className="text-gray-400">Clasificación en tiempo real de las votaciones</p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-[#c9a84c] text-[#0a0e1a]"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[#c9a84c] text-[#0a0e1a]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFinalists.map((finalist, index) => {
            const percent = maxVotes > 0 ? ((finalist.vote_count || 0) / maxVotes) * 100 : 0;
            const category = categories.find(c => c.id === finalist.category_id);
            return (
              <motion.div
                key={finalist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    {index < 3 ? (
                      <Medal className={`w-5 h-5 mx-auto ${medalColors[index]}`} />
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <img
                    src={finalist.photo_url || `https://ui-avatars.com/api/?name=${finalist.name}&background=c9a84c&color=0a0e1a&size=40`}
                    alt={finalist.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm truncate">{finalist.name}</span>
                      {category && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full hidden sm:inline">
                          {category.name}
                        </span>
                      )}
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.04 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#c9a84c] to-[#e8d48b] rounded-full"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{finalist.vote_count || 0}</span>
                    <span className="text-gray-500 text-xs ml-1">votos</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {sortedFinalists.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No hay datos de votación aún.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}