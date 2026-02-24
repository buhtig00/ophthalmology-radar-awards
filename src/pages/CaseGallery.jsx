import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Award, Star, Loader2, Eye } from "lucide-react";
import CaseMetadataBadges from "@/components/case/CaseMetadataBadges";

export default function CaseGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

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

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      const matchesSearch = searchQuery === "" ||
        caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || caseItem.category_id === categoryFilter;
      const matchesHospital = hospitalFilter === "all" || caseItem.hospital === hospitalFilter;
      const matchesCountry = countryFilter === "all" || caseItem.country === countryFilter;

      return matchesSearch && matchesCategory && matchesHospital && matchesCountry;
    });
  }, [cases, searchQuery, categoryFilter, hospitalFilter, countryFilter]);

  if (casesLoading || scoresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1320] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-[#c9a84c]" />
            <h1 className="text-3xl font-bold text-white">Galería de Casos</h1>
          </div>
          <p className="text-gray-400">
            Explora los casos aprobados para los Óscars de Ophthalmology Radar 2026
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar por título o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Todas las categorías" />
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
                <SelectValue placeholder="Todos los hospitales" />
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
                <SelectValue placeholder="Todos los países" />
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

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{filteredCases.length} casos encontrados</span>
            {(categoryFilter !== "all" || hospitalFilter !== "all" || countryFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setHospitalFilter("all");
                  setCountryFilter("all");
                  setSearchQuery("");
                }}
                className="text-[#c9a84c] hover:text-[#e8d48b]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No se encontraron casos con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map(caseItem => {
              const avgScore = caseAverages[caseItem.id];
              
              return (
                <Link
                  key={caseItem.id}
                  to={`${createPageUrl("CaseDetail")}?id=${caseItem.id}`}
                  className="block group"
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-[#c9a84c]/30 transition-all h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          {avgScore && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs mb-2">
                              <Star className="w-3 h-3 mr-1" />
                              {avgScore.total.toFixed(1)}/40 pts
                            </Badge>
                          )}
                        </div>
                        <Eye className="w-4 h-4 text-gray-500 group-hover:text-[#c9a84c] transition-colors" />
                      </div>
                      
                      <CardTitle className="text-white group-hover:text-[#c9a84c] transition-colors line-clamp-2 mb-2">
                        {caseItem.title}
                      </CardTitle>
                      
                      <CardDescription className="text-gray-400 line-clamp-2 mb-3">
                        {caseItem.description}
                      </CardDescription>

                      <CaseMetadataBadges caseData={caseItem} variant="compact" />
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Jury Scores Breakdown */}
                      {avgScore && (
                        <div className="pt-3 border-t border-white/5">
                          <div className="text-xs text-gray-500 mb-2">
                            Evaluado por {avgScore.juryCount} {avgScore.juryCount === 1 ? 'jurado' : 'jurados'}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Innovación:</span>
                              <span className="text-white font-medium">{avgScore.innovation.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Impacto:</span>
                              <span className="text-white font-medium">{avgScore.clinical.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Presentación:</span>
                              <span className="text-white font-medium">{avgScore.presentation.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Docente:</span>
                              <span className="text-white font-medium">{avgScore.teaching.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}