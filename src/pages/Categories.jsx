import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

const CATEGORY_ICONS = {
  "Retina": "👁️",
  "Glaucoma": "💧",
  "Segmento Anterior": "🔬",
  "Córnea": "🌀",
  "Oculoplástica": "✨",
  "Pediatría": "👶",
};

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: finalists = [] } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.filter({ is_active: true }),
  });

  const getFinalistCount = (catId) => finalists.filter(f => f.category_id === catId).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Categorías</h1>
        <p className="text-gray-400">Explora todas las especialidades de los premios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={createPageUrl("Voting") + `?category=${cat.id}`}
              className="group block rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c9a84c]/20 transition-all duration-300 overflow-hidden"
            >
              {cat.image_url && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{CATEGORY_ICONS[cat.name] || "🏆"}</div>
                  <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                    {getFinalistCount(cat.id)} finalistas
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{cat.description}</p>
                <div className="flex items-center gap-1.5 text-[#c9a84c] text-sm font-medium">
                  Ver y votar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}