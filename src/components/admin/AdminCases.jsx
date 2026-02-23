import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink, Eye, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

const STATUS_STYLE = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminCases() {
  const queryClient = useQueryClient();
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["adminCases"],
    queryFn: () => base44.entities.Case.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Case.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCases"] });
      toast.success("Caso actualizado");
    },
  });

  const approve = (c) => updateMutation.mutate({ id: c.id, data: { status: "approved", reviewed_at: new Date().toISOString() } });
  const reject = () => {
    updateMutation.mutate({ id: rejectDialog.id, data: { status: "rejected", rejection_reason: rejectReason, reviewed_at: new Date().toISOString() } });
    setRejectDialog(null);
    setRejectReason("");
  };

  const filtered = cases.filter(c => {
    const matchesStatus = filter === "all" || c.status === filter;
    const matchesSearch = searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.created_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-[#c9a84c]" />
        <h2 className="text-xl font-bold text-white">Casos enviados</h2>
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
          {["all", "pending", "approved", "rejected"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f ? "bg-[#c9a84c] text-[#0a0e1a]" : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "approved" ? "Aprobados" : "Rechazados"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron casos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-600 text-xs font-mono">{c.case_id}</span>
                    <Badge variant="outline" className={`${STATUS_STYLE[c.status]} text-xs`}>
                      {c.status}
                    </Badge>
                  </div>
                  <Link to={createPageUrl("CaseDetail") + `?id=${c.id}`}>
                    <h4 className="text-white font-medium text-sm hover:text-[#c9a84c] transition-colors">{c.title}</h4>
                  </Link>
                  <p className="text-gray-500 text-xs mt-1">
                    {c.created_by} · {c.category_name} · {format(new Date(c.created_date), "d MMM yyyy")}
                  </p>
                  <Link 
                    to={createPageUrl("CaseDetail") + `?id=${c.id}`}
                    className="inline-flex items-center gap-1 text-[#c9a84c] text-xs mt-2 hover:underline"
                  >
                    <Eye className="w-3 h-3" /> Ver detalles
                  </Link>
                </div>
                {c.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => approve(c)}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprobar
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8" onClick={() => setRejectDialog(c)}>
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Rechazar caso</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo..."
            className="bg-white/5 border-white/10 text-white"
          />
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={() => setRejectDialog(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={reject}>Confirmar Rechazo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}