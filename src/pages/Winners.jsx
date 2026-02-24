import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Award, Trophy, Star, Users, Eye, Loader2, Medal, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import VideoPreviewCard from "@/components/case/VideoPreviewCard";

export default function Winners() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["finalist-cases"],
    queryFn: () => base44.entities.Case.filter({ status: "finalist" }),
  });

  const { data: juryScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["jury-scores-winners"],
    queryFn: () => base44.entities.JuryScore.list(),
  });

  const { data: jury = [] } = useQuery({
    queryKey: ["jury"],
    queryFn: () => base44.entities.Jury.filter({ is_active: true }),
  });

  // Calculate winners per category (highest average score)
  const winners = useMemo(() => {
    const winnersByCategory = {};

    categories.forEach(category => {
      const categoryCases = cases.filter(c => c.category_id === category.id);
      
      if (categoryCases.length === 0) return;

      // Calculate average scores
      const casesWithScores = categoryCases.map(caseItem => {
        const caseScores = juryScores.filter(s => s.case_id === caseItem.id);
        
        if (caseScores.length === 0) return null;

        const avgTotal = caseScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / caseScores.length;
        const avgInnovation = caseScores.reduce((sum, s) => sum + (s.innovation_score || 0), 0) / caseScores.length;
        const avgClinical = caseScores.reduce((sum, s) => sum + (s.clinical_impact_score || 0), 0) / caseScores.length;
        const avgPresentation = caseScores.reduce((sum, s) => sum + (s.presentation_quality_score || 0), 0) / caseScores.length;
        const avgTeaching = caseScores.reduce((sum, s) => sum + (s.teaching_value_score || 0), 0) / caseScores.length;

        // Get jury comments
        const comments = caseScores
          .filter(s => s.comments)
          .map(s => ({ juryName: s.jury_name, comment: s.comments }));

        return {
          ...caseItem,
          avgTotal,
          avgInnovation,
          avgClinical,
          avgPresentation,
          avgTeaching,
          juryCount: caseScores.length,
          comments
        };
      }).filter(Boolean);

      // Get winner (highest score)
      if (casesWithScores.length > 0) {
        const winner = casesWithScores.reduce((prev, current) => 
          (current.avgTotal > prev.avgTotal) ? current : prev
        );

        winnersByCategory[category.id] = {
          category,
          winner
        };
      }
    });

    return winnersByCategory;
  }, [categories, cases, juryScores]);

  const isLoading = categoriesLoading || casesLoading || scoresLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  const hasWinners = Object.keys(winners).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1320] via-black to-[#0f1320] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#C9A227] to-[#E8C547] mb-6 shadow-2xl shadow-[#C9A227]/50">
            <Trophy className="w-10 h-10 text-black" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Ganadores{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-[#E8C547]">
              2026
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Celebrando la excelencia en cirugía oftalmológica a nivel mundial
          </p>

          {jury.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-[#C9A227]" />
              <span>Evaluado por {jury.length} jurados internacionales</span>
            </div>
          )}
        </motion.div>

        {/* Winners by Category */}
        {!hasWinners ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="py-16 text-center">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Los ganadores serán anunciados pronto</p>
                <p className="text-gray-500 text-sm">El jurado está evaluando todos los casos finalistas</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {Object.values(winners).map((item, idx) => {
              const { category, winner } = item;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-[#C9A227]" />
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {category.name}
                      </h2>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#C9A227]/50 to-transparent" />
                  </div>

                  {/* Winner Card */}
                  <div className="relative">
                    {/* Winner Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-[#C9A227] to-[#E8C547] text-black font-bold text-sm px-4 py-2 shadow-xl">
                        <Sparkles className="w-4 h-4 mr-1" />
                        GANADOR
                      </Badge>
                    </div>

                    <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-[#C9A227]/30 border-2 backdrop-blur-xl overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-6 p-6">
                        {/* Left: Video/Image */}
                        <div className="space-y-4">
                          {winner.video_url ? (
                            <VideoPreviewCard
                              videoUrl={winner.video_url}
                              title={winner.title}
                              onClick={() => window.location.href = `${createPageUrl("CaseDetail")}?id=${winner.id}`}
                            />
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-[#C9A227]/20 to-transparent rounded-xl flex items-center justify-center">
                              <Award className="w-16 h-16 text-[#C9A227]/50" />
                            </div>
                          )}

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/[0.05] rounded-lg p-3 border border-white/10">
                              <div className="text-xs text-gray-400 mb-1">Puntuación Total</div>
                              <div className="text-2xl font-bold text-[#C9A227]">
                                {winner.avgTotal.toFixed(1)}
                                <span className="text-sm text-gray-500">/40</span>
                              </div>
                            </div>
                            <div className="bg-white/[0.05] rounded-lg p-3 border border-white/10">
                              <div className="text-xs text-gray-400 mb-1">Evaluaciones</div>
                              <div className="text-2xl font-bold text-white">{winner.juryCount}</div>
                            </div>
                          </div>

                          {/* Individual Scores */}
                          <div className="space-y-2">
                            {[
                              { label: "💡 Innovación", value: winner.avgInnovation, color: "purple" },
                              { label: "⚡ Impacto Clínico", value: winner.avgClinical, color: "green" },
                              { label: "🎨 Presentación", value: winner.avgPresentation, color: "blue" },
                              { label: "📚 Valor Docente", value: winner.avgTeaching, color: "orange" }
                            ].map(metric => (
                              <div key={metric.label} className="flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-400">{metric.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full bg-${metric.color}-500 rounded-full`}
                                      style={{ width: `${(metric.value / 10) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-white w-8">{metric.value.toFixed(1)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Details */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                              {winner.title}
                            </h3>

                            {winner.description && (
                              <p className="text-gray-400 leading-relaxed mb-4">
                                {winner.description}
                              </p>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {winner.hospital && (
                                <Badge variant="outline" className="border-white/20 text-gray-300">
                                  🏥 {winner.hospital}
                                </Badge>
                              )}
                              {winner.country && (
                                <Badge variant="outline" className="border-white/20 text-gray-300">
                                  📍 {winner.country}
                                </Badge>
                              )}
                              {winner.specialty && (
                                <Badge variant="outline" className="border-white/20 text-gray-300">
                                  ⚕️ {winner.specialty}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Why They Won */}
                          {winner.comments && winner.comments.length > 0 && (
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                              <h4 className="text-sm font-semibold text-[#C9A227] mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Comentarios del Jurado
                              </h4>
                              <div className="space-y-3">
                                {winner.comments.slice(0, 2).map((comment, i) => (
                                  <div key={i} className="text-sm">
                                    <p className="text-gray-400 italic leading-relaxed mb-1">
                                      "{comment.comment}"
                                    </p>
                                    {comment.juryName && (
                                      <p className="text-xs text-gray-500">— {comment.juryName}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vote Stats */}
                          {winner.vote_count > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Medal className="w-4 h-4 text-[#C9A227]" />
                              <span>{winner.vote_count} votos del público</span>
                            </div>
                          )}

                          {/* View Details Button */}
                          <Link
                            to={`${createPageUrl("CaseDetail")}?id=${winner.id}`}
                            className="block w-full"
                          >
                            <button className="w-full px-6 py-3 bg-gradient-to-r from-[#C9A227] to-[#E8C547] text-black font-bold rounded-lg hover:shadow-xl hover:shadow-[#C9A227]/50 transition-all">
                              <div className="flex items-center justify-center gap-2">
                                <Eye className="w-4 h-4" />
                                Ver Caso Completo
                              </div>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Jury Section */}
        {jury.length > 0 && hasWinners && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Panel de Jurados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {jury.map((judge, idx) => (
                <motion.div
                  key={judge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="text-center"
                >
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    {judge.photo_url ? (
                      <img
                        src={judge.photo_url}
                        alt={judge.name}
                        className="w-full h-full rounded-full object-cover border-2 border-[#C9A227]/30"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C9A227]/20 to-white/5 flex items-center justify-center border-2 border-[#C9A227]/30">
                        <Users className="w-8 h-8 text-[#C9A227]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white mb-0.5">{judge.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{judge.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}