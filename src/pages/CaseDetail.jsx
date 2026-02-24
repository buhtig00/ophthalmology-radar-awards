import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import GitHubActivity from "../components/admin/GitHubActivity";
import CommentSection from "../components/voting/CommentSection";
import AdvancedVideoPlayer from "../components/case/AdvancedVideoPlayer";
import InteractiveMediaGallery from "../components/case/InteractiveMediaGallery";
import CaseMetadataBadges from "../components/case/CaseMetadataBadges";

const STATUS_CONFIG = {
  pending: { label: "En revisión", icon: Clock, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  approved: { label: "Aprobado", icon: CheckCircle2, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  rejected: { label: "Rechazado", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function CaseDetail() {
  const [caseId, setCaseId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    setCaseId(params.get("id"));
  }, []);

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      const cases = await base44.entities.Case.list();
      return cases.find(c => c.id === caseId);
    },
    enabled: !!caseId,
  });

  if (isLoading || !caseId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto text-center py-20">
        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Caso no encontrado</h2>
        <Link to={createPageUrl("MyCases")}>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 mt-4">
            Volver a mis casos
          </Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[caseData.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isOwner = user && user.email === caseData.created_by;
  const isAdmin = user && user.role === "admin";

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <Link to={createPageUrl(isAdmin ? "Admin" : "MyCases")}>
        <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-500 text-sm font-mono">{caseData.case_id}</span>
                <Badge variant="outline" className={`${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {status.label}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{caseData.title}</h1>
              {caseData.description && (
                <p className="text-gray-400 text-lg leading-relaxed">{caseData.description}</p>
              )}
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="pt-4 border-t border-white/5">
            <CaseMetadataBadges caseData={caseData} variant="detailed" />
          </div>
        </div>

        {/* GitHub Activity */}
        {(isAdmin || isOwner) && (
          <GitHubActivity caseData={caseData} />
        )}

        {/* Video */}
        {caseData.video_url && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <AdvancedVideoPlayer src={caseData.video_url} />
          </div>
        )}

        {/* Attachments Gallery */}
        {caseData.attachment_urls && caseData.attachment_urls.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <InteractiveMediaGallery attachments={caseData.attachment_urls} />
          </div>
        )}

        {/* Rejection Reason */}
        {caseData.status === "rejected" && caseData.rejection_reason && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-red-400 font-semibold text-lg mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Motivo del rechazo
            </h2>
            <p className="text-red-300">{caseData.rejection_reason}</p>
            {caseData.reviewed_at && (
              <p className="text-red-400/60 text-sm mt-3">
                Revisado el {format(new Date(caseData.reviewed_at), "d 'de' MMMM, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Admin Review Info */}
        {(isAdmin || (isOwner && caseData.reviewed_at)) && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Información de revisión</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Enviado por:</span>
                <span className="text-white">{caseData.created_by}</span>
              </div>
              {caseData.reviewed_at && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha de revisión:</span>
                    <span className="text-white">
                      {format(new Date(caseData.reviewed_at), "d 'de' MMMM, yyyy 'a las' HH:mm")}
                    </span>
                  </div>
                  {caseData.reviewed_by && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revisado por:</span>
                      <span className="text-white">{caseData.reviewed_by}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Comment Section */}
        <CommentSection caseId={caseId} />
      </motion.div>
    </div>
  );
}