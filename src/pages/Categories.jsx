import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Users, Award, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const { data: cases = [] } = useQuery({
    queryKey: ["approved-cases"],
    queryFn: () => base44.entities.Case.filter({ status: "approved" }),
  });

  const getFinalistCount = (catId) => finalists.filter(f => f.category_id === catId).length;
  const getCasesCount = (catId) => cases.filter(c => c.category_id === catId).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1320] to-black py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8C547] flex items-center justify-center">
              <Award className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Categorías</h1>
              <p className="text-gray-400 text-sm">
                {categories.length} especialidades en competencia
              </p>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const finalistCount = getFinalistCount(cat.id);
            const casesCount = getCasesCount(cat.id);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  to={createPageUrl("Voting") + `?category=${cat.id}`}
                  className="group block h-full"
                >
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#C9A227]/40 backdrop-blur-xl transition-all duration-300 overflow-hidden">
                    {/* Image Header */}
                    {cat.image_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                          <div className="text-4xl">{CATEGORY_ICONS[cat.name] || "🏆"}</div>
                          <div className="flex gap-2">
                            {finalistCount > 0 && (
                              <Badge className="bg-black/70 backdrop-blur-xl text-[#C9A227] border-[#C9A227]/30">
                                <Users className="w-3 h-3 mr-1" />
                                {finalistCount}
                              </Badge>
                            )}
                            {casesCount > 0 && (
                              <Badge className="bg-black/70 backdrop-blur-xl text-blue-400 border-blue-400/30">
                                <Eye className="w-3 h-3 mr-1" />
                                {casesCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-[#C9A227]/20 to-transparent flex items-center justify-center">
                        <div className="text-6xl opacity-50">{CATEGORY_ICONS[cat.name] || "🏆"}</div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          {finalistCount > 0 && (
                            <Badge className="bg-black/50 backdrop-blur-xl text-[#C9A227] border-[#C9A227]/30">
                              <Users className="w-3 h-3 mr-1" />
                              {finalistCount}
                            </Badge>
                          )}
                          {casesCount > 0 && (
                            <Badge className="bg-black/50 backdrop-blur-xl text-blue-400 border-blue-400/30">
                              <Eye className="w-3 h-3 mr-1" />
                              {casesCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-white font-bold text-xl mb-3 group-hover:text-[#C9A227] transition-colors">
                        {cat.name}
                      </h3>
                      
                      {cat.description && (
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                          {cat.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-4 text-xs">
                          {finalistCount > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Users className="w-3.5 h-3.5" />
                              <span>{finalistCount} finalista{finalistCount !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {casesCount > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{casesCount} caso{casesCount !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[#C9A227] text-sm font-semibold">
                          Ver casos
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay categorías disponibles</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}