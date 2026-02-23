import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending: { label: "En revisión", icon: Clock, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  approved: { label: "Aprobado", icon: CheckCircle2, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  rejected: { label: "Rechazado", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function CasesHistory({ user }) {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["userCases", user.email],
    queryFn: () => base44.entities.Case.filter({ created_by: user.email }, "-created_date"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-1">No has enviado ningún caso clínico</p>
        <p className="text-gray-600 text-sm">Tus casos enviados aparecerán aquí</p>
      </div>
    );
  }

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === "pending").length,
    approved: cases.filter(c => c.status === "approved").length,
    rejected: cases.filter(c => c.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total</p>
          <p className="text-white text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1">En Revisión</p>
          <p className="text-white text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-green-400 text-xs uppercase tracking-wider mb-1">Aprobados</p>
          <p className="text-white text-2xl font-bold">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400 text-xs uppercase tracking-wider mb-1">Rechazados</p>
          <p className="text-white text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {cases.map((c, i) => {
          const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-xs font-mono">{c.case_id}</span>
                    <Badge variant="outline" className={`${status.color} text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{c.title}</h4>
                  {c.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {c.category_name && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                    {c.category_name}
                  </span>
                )}
                {c.hospital && <span>{c.hospital}</span>}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(c.created_date), "d MMM yyyy")}
                </span>
              </div>

              {c.status === "rejected" && c.rejection_reason && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-red-400 text-sm">
                    <strong className="font-semibold">Motivo del rechazo:</strong> {c.rejection_reason}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}