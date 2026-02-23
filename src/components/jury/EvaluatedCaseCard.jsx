import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Activity, Star, BookOpen, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const CRITERIA = [
  { key: "innovation_score", label: "Innovación", icon: Lightbulb, color: "text-purple-400" },
  { key: "clinical_impact_score", label: "Impacto Clínico", icon: Activity, color: "text-green-400" },
  { key: "presentation_quality_score", label: "Presentación", icon: Star, color: "text-yellow-400" },
  { key: "teaching_value_score", label: "Valor Docente", icon: BookOpen, color: "text-blue-400" }
];

export default function EvaluatedCaseCard({ caseData, score }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                {caseData.case_id}
              </Badge>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                Evaluado
              </Badge>
            </div>
            <CardTitle className="text-white mb-2">{caseData.title}</CardTitle>
            {caseData.category_name && (
              <Badge className="bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20">
                {caseData.category_name}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c9a84c]">{score?.total_score || 0}</div>
            <div className="text-xs text-gray-500">/ 40 puntos</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CRITERIA.map(criterion => {
            const Icon = criterion.icon;
            const value = score?.[criterion.key] || 0;
            return (
              <div key={criterion.key} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${criterion.color}`} />
                  <span className="text-xs text-gray-400">{criterion.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{value}<span className="text-sm text-gray-500">/10</span></div>
              </div>
            );
          })}
        </div>

        {score?.comments && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Tus Comentarios</span>
            </div>
            <p className="text-sm text-gray-300">{score.comments}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Evaluado el {format(new Date(score?.created_date), "dd/MM/yyyy 'a las' HH:mm")}
        </div>
      </CardContent>
    </Card>
  );
}