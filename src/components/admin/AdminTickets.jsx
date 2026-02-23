import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Ticket, User, Mail, Calendar, CreditCard, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminTickets() {
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["allTickets"],
    queryFn: () => base44.entities.Ticket.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const getUserByEmail = (email) => users.find(u => u.email === email);

  const filteredTickets = tickets.filter(t => {
    if (!search) return true;
    const user = getUserByEmail(t.created_by);
    const searchLower = search.toLowerCase();
    return (
      t.code?.toLowerCase().includes(searchLower) ||
      t.created_by?.toLowerCase().includes(searchLower) ||
      user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const paidTickets = filteredTickets.filter(t => t.paid);
  const streamingTickets = paidTickets.filter(t => t.type === "streaming");
  const vipTickets = paidTickets.filter(t => t.type === "vip");
  const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.price || 0), 0);

  const exportTickets = () => {
    const csv = [
      ["Código", "Tipo", "Usuario", "Email", "Precio (€)", "Pagado", "Fecha de Pago"].join(","),
      ...paidTickets.map(t => {
        const user = getUserByEmail(t.created_by);
        return [
          t.code,
          t.type_name || t.type,
          user?.full_name || "N/A",
          t.created_by,
          ((t.price || 0) / 100).toFixed(2),
          t.paid ? "Sí" : "No",
          t.paid_at ? format(new Date(t.paid_at), "dd/MM/yyyy HH:mm") : "N/A"
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Tickets de Streaming</h3>
        <p className="text-sm text-gray-500">Vista general de todos los tickets comprados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total Tickets</span>
          </div>
          <p className="text-2xl font-bold text-white">{paidTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Streaming</span>
          </div>
          <p className="text-2xl font-bold text-white">{streamingTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-5 h-5 text-[#C9A227]" />
            <span className="text-gray-400 text-sm">VIP</span>
          </div>
          <p className="text-2xl font-bold text-white">{vipTickets.length}</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-white">€{(totalRevenue / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por código, email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
        <Button
          onClick={exportTickets}
          className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold whitespace-nowrap"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
            <Ticket className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No se encontraron tickets</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const user = getUserByEmail(ticket.created_by);
            
            return (
              <div
                key={ticket.id}
                className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-gray-500 text-xs font-mono">{ticket.code}</span>
                      <Badge
                        variant="outline"
                        className={
                          ticket.type === "vip"
                            ? "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }
                      >
                        {ticket.type_name || ticket.type}
                      </Badge>
                      {ticket.paid && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          Pagado
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{user?.full_name || "Usuario desconocido"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{ticket.created_by}</span>
                      </div>
                      {ticket.paid_at && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(ticket.paid_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-semibold text-white">
                          €{((ticket.price || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}