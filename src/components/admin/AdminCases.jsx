import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink, Eye, Search, FileText, Award, Users, Video, Paperclip, Building2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

const STATUS_STYLE = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  in_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  finalist: "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/20",
};

export default function AdminCases() {
  const queryClient = useQueryClient();
  const [rejectDialog, setRejectDialog] = useState(null);
  const [detailDialog, setDetailDialog] = useState(null);
  const [assignDialog, setAssignDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedJury, setSelectedJury] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["adminCases"],
    queryFn: () => base44.entities.Case.list("-created_date"),
  });

  const { data: juryMembers = [] } = useQuery({
    queryKey: ["jury"],
    queryFn: () => base44.entities.Jury.filter({ is_active: true }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Case.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCases"] });
      toast.success("Caso actualizado");
      setDetailDialog(null);
    },
  });

  const approve = (c) => updateMutation.mutate({ 
    id: c.id, 
    data: { 
      status: "approved", 
      reviewed_at: new Date().toISOString() 
    } 
  });

  const markAsFinalist = (c) => updateMutation.mutate({ 
    id: c.id, 
    data: { 
      status: "finalist"
    } 
  });

  const changeStatus = (c, newStatus) => updateMutation.mutate({
    id: c.id,
    data: { status: newStatus }
  });

  const reject = () => {
    updateMutation.mutate({ 
      id: rejectDialog.id, 
      data: { 
        status: "rejected", 
        rejection_reason: rejectReason, 
        reviewed_at: new Date().toISOString() 
      } 
    });
    setRejectDialog(null);
    setRejectReason("");
  };

  const filtered = cases.filter(c => {
    const matchesStatus = filter === "all" || c.status === filter;
    const matchesSearch = searchQuery === "" ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.created_by?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-[#C9A227]" />
        <h2 className="text-xl font-bold text-white">Gestión de Casos</h2>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400">
          {filtered.length} casos
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por título, ID o usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "pending", "in_review", "approved", "finalist", "rejected"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f ? "bg-[#C9A227] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "in_review" ? "En Revisión" : f === "approved" ? "Aprobados" : f === "finalist" ? "Finalistas" : "Rechazados"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron casos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600 text-xs font-mono">{c.case_id}</span>
                    <Badge variant="outline" className={`${STATUS_STYLE[c.status]} text-xs`}>
                      {c.status}
                    </Badge>
                    {c.vote_count > 0 && (
                      <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                        {c.vote_count} votos
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="text-white font-semibold mb-2">{c.title}</h4>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                    <span>{c.created_by}</span>
                    {c.category_name && <span>• {c.category_name}</span>}
                    {c.hospital && <span>• {c.hospital}</span>}
                    <span>• {format(new Date(c.created_date), "d MMM yyyy")}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 h-8"
                      onClick={() => setDetailDialog(c)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver detalles
                    </Button>
                    
                    {c.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8" 
                          onClick={() => changeStatus(c, "in_review")}
                        >
                          <Users className="w-3.5 h-3.5 mr-1" /> En Revisión
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white h-8" 
                          onClick={() => approve(c)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprobar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8" 
                          onClick={() => setRejectDialog(c)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                        </Button>
                      </>
                    )}

                    {c.status === "in_review" && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white h-8" 
                          onClick={() => approve(c)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprobar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8" 
                          onClick={() => setRejectDialog(c)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                        </Button>
                      </>
                    )}

                    {c.status === "approved" && (
                      <Button 
                        size="sm" 
                        className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold h-8" 
                        onClick={() => markAsFinalist(c)}
                      >
                        <Award className="w-3.5 h-3.5 mr-1" /> Marcar Finalista
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="bg-[#0a0e1a] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles del Caso</DialogTitle>
          </DialogHeader>
          
          {detailDialog && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-xs font-mono">{detailDialog.case_id}</span>
                  <Badge variant="outline" className={STATUS_STYLE[detailDialog.status]}>
                    {detailDialog.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white">{detailDialog.title}</h3>
              </div>

              {detailDialog.description && (
                <div>
                  <Label className="text-gray-400 text-sm">Descripción</Label>
                  <p className="text-gray-300 mt-1">{detailDialog.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Usuario</Label>
                  <p className="text-white mt-1">{detailDialog.created_by}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Fecha de Envío</Label>
                  <p className="text-white mt-1">{format(new Date(detailDialog.created_date), "dd/MM/yyyy HH:mm")}</p>
                </div>
                {detailDialog.category_name && (
                  <div>
                    <Label className="text-gray-400 text-sm">Categoría</Label>
                    <p className="text-white mt-1">{detailDialog.category_name}</p>
                  </div>
                )}
                {detailDialog.surgery_type && (
                  <div>
                    <Label className="text-gray-400 text-sm">Tipo de Cirugía</Label>
                    <p className="text-white mt-1">{detailDialog.surgery_type}</p>
                  </div>
                )}
                {detailDialog.hospital && (
                  <div>
                    <Label className="text-gray-400 text-sm">Hospital</Label>
                    <p className="text-white mt-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {detailDialog.hospital}
                    </p>
                  </div>
                )}
                {detailDialog.country && (
                  <div>
                    <Label className="text-gray-400 text-sm">País</Label>
                    <p className="text-white mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {detailDialog.country}
                    </p>
                  </div>
                )}
              </div>

              {detailDialog.video_url && (
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video del Caso
                  </Label>
                  <video controls className="w-full rounded-lg" src={detailDialog.video_url} />
                </div>
              )}

              {detailDialog.attachment_urls && detailDialog.attachment_urls.length > 0 && (
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Archivos Adjuntos ({detailDialog.attachment_urls.length})
                  </Label>
                  <div className="space-y-2">
                    {detailDialog.attachment_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-sm"
                      >
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300">Archivo {idx + 1}</span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {detailDialog.rejection_reason && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Label className="text-red-400 text-sm mb-1 block">Motivo de Rechazo</Label>
                  <p className="text-red-300 text-sm">{detailDialog.rejection_reason}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Link to={`${createPageUrl("CaseDetail")}?id=${detailDialog.id}`} target="_blank" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver en Página Pública
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-[#0a0e1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Rechazar caso</DialogTitle>
            <DialogDescription className="text-gray-400">
              Proporciona un motivo para el rechazo del caso
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo..."
            rows={4}
            className="bg-white/5 border-white/10 text-white"
          />
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => setRejectDialog(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={reject}
              disabled={!rejectReason}
            >
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}