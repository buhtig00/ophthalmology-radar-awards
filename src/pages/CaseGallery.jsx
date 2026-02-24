import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Award, Star, Loader2, Eye, Video, TrendingUp, Filter, X } from "lucide-react";
import CaseMetadataBadges from "@/components/case/CaseMetadataBadges";
import VideoPreviewCard from "@/components/case/VideoPreviewCard";

export default function CaseGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["gallery-cases"],
    queryFn: () => base44.entities.Case.filter({ status: "approved" })
  });

  const { data: juryScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["jury-scores"],
    queryFn: () => base44.entities.JuryScore.list()
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true })
  });

  // Calculate average scores for each case
  const caseAverages = useMemo(() => {
    const averages = {};
    cases.forEach(caseItem => {
      const caseScores = juryScores.filter(s => s.case_id === caseItem.id);
      if (caseScores.length > 0) {
        const avgTotal = caseScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / caseScores.length;
        const avgInnovation = caseScores.reduce((sum, s) => sum + (s.innovation_score || 0), 0) / caseScores.length;
        const avgClinical = caseScores.reduce((sum, s) => sum + (s.clinical_impact_score || 0), 0) / caseScores.length;
        const avgPresentation = caseScores.reduce((sum, s) => sum + (s.presentation_quality_score || 0), 0) / caseScores.length;
        const avgTeaching = caseScores.reduce((sum, s) => sum + (s.teaching_value_score || 0), 0) / caseScores.length;
        
        averages[caseItem.id] = {
          total: avgTotal,
          innovation: avgInnovation,
          clinical: avgClinical,
          presentation: avgPresentation,
          teaching: avgTeaching,
          juryCount: caseScores.length
        };
      }
    });
    return averages;
  }, [cases, juryScores]);

  // Get unique hospitals and countries
  const hospitals = useMemo(() => {
    const unique = [...new Set(cases.map(c => c.hospital).filter(Boolean))];
    return unique.sort();
  }, [cases]);

  const countries = useMemo(() => {
    const unique = [...new Set(cases.map(c => c.country).filter(Boolean))];
    return unique.sort();
  }, [cases]);

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    let filtered = cases.filter(caseItem => {
      const matchesSearch = searchQuery === "" ||
        caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || caseItem.category_id === categoryFilter;
      const matchesHospital = hospitalFilter === "all" || caseItem.hospital === hospitalFilter;
      const matchesCountry = countryFilter === "all" || caseItem.country === countryFilter;

      return matchesSearch && matchesCategory && matchesHospital && matchesCountry;
    });

    // Sort cases
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === "votes") {
        return (b.vote_count || 0) - (a.vote_count || 0);
      } else if (sortBy === "score") {
        const scoreA = caseAverages[a.id]?.total || 0;
        const scoreB = caseAverages[b.id]?.total || 0;
        return scoreB - scoreA;
      }
      return 0;
    });

    return filtered;
  }, [cases, searchQuery, categoryFilter, hospitalFilter, countryFilter, sortBy, caseAverages]);

  if (casesLoading || scoresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  const hasActiveFilters = categoryFilter !== "all" || hospitalFilter !== "all" || 
                          countryFilter !== "all" || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1320] to-black py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8C547] flex items-center justify-center">
                <Award className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Galería de Casos</h1>
                <p className="text-gray-400 text-sm">
                  {cases.length} casos aprobados
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge className="ml-2 bg-[#C9A227] text-black">!</Badge>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Search & Sort Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar casos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white h-11"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white w-full sm:w-48 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-white/10">
              <SelectItem value="recent" className="text-white">Más recientes</SelectItem>
              <SelectItem value="votes" className="text-white">Más votados</SelectItem>
              <SelectItem value="score" className="text-white">Mayor puntuación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        <motion.div
          initial={false}
          animate={{ height: showFilters || window.innerWidth >= 1024 ? "auto" : 0, opacity: showFilters || window.innerWidth >= 1024 ? 1 : 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Filter className="w-4 h-4 text-[#C9A227]" />
                Filtros
              </div>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCategoryFilter("all");
                    setHospitalFilter("all");
                    setCountryFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-[#c9a84c] hover:text-[#e8d48b] h-8"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10">
                  <SelectItem value="all" className="text-white">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="text-white">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Hospital" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10">
                  <SelectItem value="all" className="text-white">Todos los hospitales</SelectItem>
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital} value={hospital} className="text-white">
                      {hospital}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10">
                  <SelectItem value="all" className="text-white">Todos los países</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country} className="text-white">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Results Counter */}
        <div className="mb-6 text-sm text-gray-400 flex items-center gap-2">
          <span>{filteredCases.length} casos encontrados</span>
          {hasActiveFilters && (
            <Badge variant="outline" className="border-[#C9A227]/30 text-[#C9A227]">
              Filtros activos
            </Badge>
          )}
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No se encontraron casos</p>
                <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem, idx) => {
              const avgScore = caseAverages[caseItem.id];
              
              return (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={`${createPageUrl("CaseDetail")}?id=${caseItem.id}`}
                    className="block group h-full"
                  >
                    <Card className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-[#c9a84c]/40 transition-all h-full overflow-hidden backdrop-blur-xl">
                      {/* Video Preview */}
                      {caseItem.video_url && (
                        <div className="relative">
                          <VideoPreviewCard
                            videoUrl={caseItem.video_url}
                            title={caseItem.title}
                            onClick={() => {}}
                          />
                          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            {avgScore && (
                              <Badge className="bg-black/70 backdrop-blur-xl text-[#C9A227] border-[#C9A227]/30 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {avgScore.total.toFixed(1)}
                              </Badge>
                            )}
                            {caseItem.vote_count > 0 && (
                              <Badge className="bg-black/70 backdrop-blur-xl text-blue-400 border-blue-400/30 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {caseItem.vote_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        {!caseItem.video_url && (
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex gap-2">
                              {avgScore && (
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  {avgScore.total.toFixed(1)}
                                </Badge>
                              )}
                              {caseItem.vote_count > 0 && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {caseItem.vote_count}
                                </Badge>
                              )}
                            </div>
                            <Eye className="w-4 h-4 text-gray-500 group-hover:text-[#c9a84c] transition-colors" />
                          </div>
                        )}
                        
                        <CardTitle className="text-white group-hover:text-[#c9a84c] transition-colors line-clamp-2 text-lg">
                          {caseItem.title}
                        </CardTitle>
                        
                        <CardDescription className="text-gray-400 line-clamp-2 text-sm leading-relaxed">
                          {caseItem.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        <CaseMetadataBadges caseData={caseItem} variant="compact" />

                        {/* Jury Scores */}
                        {avgScore && (
                          <div className="pt-3 border-t border-white/5">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Evaluado por {avgScore.juryCount} {avgScore.juryCount === 1 ? 'jurado' : 'jurados'}
                            </div>
                            <div className="space-y-1.5">
                              {[
                                { label: "Innovación", value: avgScore.innovation, color: "text-purple-400" },
                                { label: "Impacto", value: avgScore.clinical, color: "text-green-400" },
                                { label: "Presentación", value: avgScore.presentation, color: "text-blue-400" },
                                { label: "Docente", value: avgScore.teaching, color: "text-orange-400" }
                              ].map(metric => (
                                <div key={metric.label} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-24">{metric.label}</span>
                                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${metric.color.replace('text-', 'bg-')} rounded-full transition-all`}
                                      style={{ width: `${(metric.value / 10) * 100}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-semibold ${metric.color} w-8 text-right`}>
                                    {metric.value.toFixed(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}