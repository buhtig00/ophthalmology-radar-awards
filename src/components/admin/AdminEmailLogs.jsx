import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Search, Calendar, CheckCircle2, XCircle, Loader2,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const TEMPLATE_LABELS = {
  case_approved: "Caso aprobado",
  case_rejected: "Caso rechazado",
  voting_reminder: "Recordatorio de votación",
  finalist_announcement: "Anuncio de finalista",
  digest_daily: "Resumen diario",
  digest_weekly: "Resumen semanal"
};

export default function AdminEmailLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["emailLogs"],
    queryFn: () => base44.entities.EmailLog.list("-created_date", 100),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTemplate = templateFilter === "all" || log.template_type === templateFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesTemplate && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-[#c9a84c]" />
        <h2 className="text-xl font-bold text-white">Registro de emails</h2>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400">
          {filteredLogs.length} emails
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por destinatario o asunto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-full lg:w-[200px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tipo de plantilla" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las plantillas</SelectItem>
            {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[150px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="failed">Fallidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-500 text-xs mb-1">Total enviados</p>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => l.status === "sent").length}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-500 text-xs mb-1">Fallidos</p>
          <p className="text-red-400 text-2xl font-bold">
            {logs.filter(l => l.status === "failed").length}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-500 text-xs mb-1">Hoy</p>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => {
              const today = new Date().toDateString();
              return new Date(l.created_date).toDateString() === today;
            }).length}
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-gray-500 text-xs mb-1">Esta semana</p>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(l.created_date) >= weekAgo;
            }).length}
          </p>
        </div>
      </div>

      {/* Email Logs */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={
                      log.status === "sent"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }
                  >
                    {log.status === "sent" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {log.status === "sent" ? "Enviado" : "Fallido"}
                  </Badge>
                  <Badge variant="outline" className="bg-[#c9a84c]/10 border-[#c9a84c]/20 text-[#c9a84c]">
                    {TEMPLATE_LABELS[log.template_type] || log.template_type}
                  </Badge>
                </div>
                <p className="text-white font-medium mb-1">{log.subject}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {log.recipient}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(log.created_date), "d MMM yyyy 'a las' HH:mm")}
                  </span>
                  {log.created_by && (
                    <span>Enviado por: {log.created_by}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron registros de email</p>
        </div>
      )}
    </div>
  );
}