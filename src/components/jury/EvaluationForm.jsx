import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Activity, Star, BookOpen, Video, Paperclip, Building2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CRITERIA = [
  {
    key: "innovation_score",
    label: "Innovación y Técnica",
    description: "Evalúa la originalidad del enfoque y dominio técnico",
    icon: Lightbulb,
    color: "text-purple-400"
  },
  {
    key: "clinical_impact_score",
    label: "Impacto Clínico",
    description: "Relevancia y beneficio para el tratamiento del paciente",
    icon: Activity,
    color: "text-green-400"
  },
  {
    key: "presentation_quality_score",
    label: "Calidad de Presentación",
    description: "Claridad, organización y calidad audiovisual",
    icon: Star,
    color: "text-yellow-400"
  },
  {
    key: "teaching_value_score",
    label: "Valor Docente",
    description: "Utilidad educativa y aplicabilidad en formación",
    icon: BookOpen,
    color: "text-blue-400"
  }
];

export default function EvaluationForm({ caseData, juryId, juryName, onComplete }) {
  const [scores, setScores] = useState({
    innovation_score: 5,
    clinical_impact_score: 5,
    presentation_quality_score: 5,
    teaching_value_score: 5
  });
  const [comments, setComments] = useState("");

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.JuryScore.create(data);
    },
    onSuccess: () => {
      toast.success("Evaluación guardada exitosamente");
      onComplete();
    },
    onError: (error) => {
      toast.error("Error al guardar evaluación", {
        description: error.message
      });
    }
  });

  const handleSubmit = () => {
    if (!comments.trim()) {
      toast.error("Por favor, añade comentarios sobre tu evaluación");
      return;
    }

    const hasLowScores = Object.values(scores).some(score => score < 5);
    if (hasLowScores && comments.length < 50) {
      toast.error("Para puntuaciones bajas, proporciona comentarios más detallados (mínimo 50 caracteres)");
      return;
    }

    saveMutation.mutate({
      case_id: caseData.id,
      case_title: caseData.title,
      jury_id: juryId,
      jury_name: juryName,
      ...scores,
      total_score: calculateTotal(),
      comments: comments
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {caseData.case_id}
              </Badge>
              <Badge className="bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20">
                {caseData.category_name}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-white">{caseData.title}</CardTitle>
            {caseData.description && (
              <p className="text-gray-400">{caseData.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {caseData.hospital && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {caseData.hospital}
                </div>
              )}
              {caseData.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {caseData.country}
                </div>
              )}
              <div className="text-gray-500">•</div>
              <div>Por: {caseData.created_by}</div>
            </div>
          </div>
        </CardHeader>

        {caseData.video_url && (
          <CardContent>
            <Label className="text-white mb-2 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video del Caso
            </Label>
            <video controls className="w-full rounded-lg" src={caseData.video_url} />
          </CardContent>
        )}

        {caseData.attachment_urls && caseData.attachment_urls.length > 0 && (
          <CardContent>
            <Label className="text-white mb-2 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Archivos Adjuntos
            </Label>
            <div className="space-y-2">
              {caseData.attachment_urls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300"
                >
                  <Paperclip className="w-3 h-3" />
                  Archivo {idx + 1}
                </a>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Criterios de Evaluación</CardTitle>
          <p className="text-sm text-gray-400">Puntúa cada criterio de 1 (muy bajo) a 10 (excelente)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {CRITERIA.map(criterion => {
            const Icon = criterion.icon;
            return (
              <div key={criterion.key} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-5 h-5 mt-1 ${criterion.color}`} />
                    <div>
                      <Label className="text-white text-base">{criterion.label}</Label>
                      <p className="text-sm text-gray-400 mt-1">{criterion.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#c9a84c]">
                      {scores[criterion.key]}
                    </div>
                    <div className="text-xs text-gray-500">/ 10</div>
                  </div>
                </div>
                <div className="px-2">
                  <Slider
                    value={[scores[criterion.key]]}
                    onValueChange={([value]) => setScores({...scores, [criterion.key]: value})}
                    min={1}
                    max={10}
                    step={1}
                    className="[&_.relative]:bg-white/10 [&_[role=slider]]:bg-[#c9a84c] [&_[role=slider]]:border-[#c9a84c]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - Muy bajo</span>
                    <span>10 - Excelente</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20">
              <span className="text-white font-semibold">Puntuación Total</span>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#c9a84c]">{calculateTotal()}</div>
                <div className="text-sm text-gray-400">/ 40 puntos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Comentarios Detallados *</CardTitle>
          <p className="text-sm text-gray-400">Proporciona tu análisis y recomendaciones</p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Describe los puntos fuertes, áreas de mejora y tu evaluación general del caso..."
            rows={8}
            className="bg-white/5 border-white/10 text-white"
          />
          <p className="text-xs text-gray-500 mt-2">{comments.length} caracteres</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onComplete}
          className="flex-1 border-white/20 text-white"
          disabled={saveMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="flex-1 bg-[#c9a84c] hover:bg-[#a07c2e] text-black font-semibold"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Evaluación"
          )}
        </Button>
      </div>
    </div>
  );
}