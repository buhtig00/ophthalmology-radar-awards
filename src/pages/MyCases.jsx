import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending: { label: "En revisión", icon: Clock, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  approved: { label: "Aprobado", icon: CheckCircle2, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  rejected: { label: "Rechazado", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
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
        <FileText className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Inicia sesión</h2>
        <p className="text-gray-500 mb-6">Para ver tus casos clínicos enviados.</p>
        <Button className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
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
          <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-1">No has enviado ningún caso</p>
          <p className="text-gray-600 text-sm">Envía tu primer caso clínico desde la página de envío</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, i) => {
            const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 text-xs font-mono">{c.case_id}</span>
                      <Badge variant="outline" className={`${status.color} text-xs`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{c.title}</h3>
                    {c.description && (
                      <p className="text-gray-500 text-sm line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      {c.category_name && <span>{c.category_name}</span>}
                      {c.hospital && <span>{c.hospital}</span>}
                      <span>{format(new Date(c.created_date), "d MMM yyyy")}</span>
                    </div>
                    {c.status === "rejected" && c.rejection_reason && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-red-400 text-sm"><strong>Motivo:</strong> {c.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}