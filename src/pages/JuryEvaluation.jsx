import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";
import EvaluationForm from "@/components/jury/EvaluationForm";
import EvaluatedCaseCard from "@/components/jury/EvaluatedCaseCard";

export default function JuryEvaluation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["approved-cases"],
    queryFn: () => base44.entities.Case.filter({ status: "approved" }),
    enabled: !!user
  });

  const { data: myScores = [], isLoading: scoresLoading, refetch: refetchScores } = useQuery({
    queryKey: ["my-scores", user?.email],
    queryFn: () => base44.entities.JuryScore.filter({ jury_id: user.email }),
    enabled: !!user
  });

  if (loading || casesLoading || scoresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  const evaluatedCaseIds = new Set(myScores.map(s => s.case_id));
  const pendingCases = cases.filter(c => !evaluatedCaseIds.has(c.id));
  const evaluatedCases = cases.filter(c => evaluatedCaseIds.has(c.id));

  const handleEvaluationComplete = () => {
    setSelectedCase(null);
    refetchScores();
  };

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-[#0f1320] p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setSelectedCase(null)}
            className="mb-6 border-white/20 text-white"
          >
            ← Volver a casos
          </Button>
          <EvaluationForm
            caseData={selectedCase}
            juryId={user.email}
            juryName={user.full_name}
            onComplete={handleEvaluationComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1320] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-[#c9a84c]" />
            <h1 className="text-3xl font-bold text-white">Panel de Evaluación del Jurado</h1>
          </div>
          <p className="text-gray-400">Bienvenido, {user.full_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Casos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-white">{pendingCases.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Casos Evaluados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{evaluatedCases.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total de Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#c9a84c]" />
                <span className="text-3xl font-bold text-white">{cases.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-black">
              Pendientes de Evaluar ({pendingCases.length})
            </TabsTrigger>
            <TabsTrigger value="evaluated" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-black">
              Evaluados ({evaluatedCases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingCases.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-400">Has evaluado todos los casos disponibles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingCases.map(caseData => (
                  <Card key={caseData.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-white mb-2">{caseData.title}</CardTitle>
                          <CardDescription className="text-gray-400 line-clamp-2">
                            {caseData.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {caseData.category_name && (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {caseData.category_name}
                              </Badge>
                            )}
                            {caseData.hospital && (
                              <Badge variant="outline" className="border-white/20 text-gray-400">
                                {caseData.hospital}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedCase(caseData)}
                          className="bg-[#c9a84c] hover:bg-[#a07c2e] text-black"
                        >
                          Evaluar Caso
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="evaluated" className="space-y-4">
            {evaluatedCases.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No has evaluado ningún caso aún</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {evaluatedCases.map(caseData => {
                  const score = myScores.find(s => s.case_id === caseData.id);
                  return (
                    <EvaluatedCaseCard
                      key={caseData.id}
                      caseData={caseData}
                      score={score}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}