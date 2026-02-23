import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Award, Eye, Pencil, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending: { 
    label: "Pendiente", 
    icon: Clock, 
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    description: "Tu caso está esperando revisión inicial"
  },
  in_review: { 
    label: "En revisión por jurado", 
    icon: Eye, 
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "El jurado está evaluando tu caso"
  },
  approved: { 
    label: "Aprobado para votación", 
    icon: CheckCircle2, 
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    description: "Tu caso ha sido aprobado y será visible públicamente"
  },
  finalist: { 
    label: "Finalista", 
    icon: Award, 
    color: "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/20",
    description: "¡Felicidades! Tu caso es finalista y puede recibir votos"
  },
  rejected: { 
    label: "No seleccionado", 
    icon: XCircle, 
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Tu caso no fue seleccionado en esta ocasión"
  },
};

export default function MyCases() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["myCases", user?.email],
    queryFn: () => base44.entities.Case.filter({ created_by: user.email }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <FileText className="w-12 h-12 text-[#C9A227]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Inicia sesión</h2>
        <p className="text-gray-500 mb-6">Para ver tus casos clínicos enviados.</p>
        <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Casos</h1>
        <p className="text-gray-400">Revisa el estado de tus casos clínicos enviados</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-1">No has enviado ningún caso</p>
          <p className="text-gray-600 text-sm mb-6">Envía tu primer caso clínico desde la página de envío</p>
          <Link to={createPageUrl("SubmitCase")}>
            <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black">
              Enviar Caso
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, i) => {
            const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const canEdit = c.status === "pending" || !c.status;
            
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-gray-500 text-xs font-mono">{c.case_id}</span>
                      <Badge variant="outline" className={`${status.color} text-xs font-semibold`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {c.status === "finalist" && (
                        <Badge className="bg-[#C9A227]/20 text-[#C9A227] text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {c.vote_count || 0} votos
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-white text-lg font-semibold mb-2">{c.title}</h3>
                    
                    {/* Status description */}
                    <p className="text-sm text-gray-500 mb-3">{status.description}</p>
                    
                    {c.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{c.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {c.category_name && (
                        <span className="px-2 py-1 rounded bg-white/5">{c.category_name}</span>
                      )}
                      {c.hospital && <span>📍 {c.hospital}</span>}
                      {c.country && <span>🌍 {c.country}</span>}
                      <span>📅 {format(new Date(c.created_date), "d MMM yyyy")}</span>
                    </div>
                    
                    {c.status === "rejected" && c.rejection_reason && (
                      <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-red-400 text-sm">
                          <strong className="font-semibold">Motivo:</strong> {c.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={`${createPageUrl("CaseDetail")}?id=${c.id}`} className="flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-white/10 text-white hover:bg-white/5"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalles
                    </Button>
                  </Link>
                  
                  {canEdit && (
                    <Link to={`${createPageUrl("SubmitCase")}?edit=${c.id}`} className="flex-1">
                      <Button 
                        size="sm"
                        className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}