import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  FileText, Users, Vote, CheckCircle, Clock, XCircle,
  TrendingUp, Award, Calendar, DollarSign, Activity, Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: cases = [] } = useQuery({
    queryKey: ["allCases"],
    queryFn: () => base44.entities.Case.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: votes = [] } = useQuery({
    queryKey: ["allVotes"],
    queryFn: () => base44.entities.Vote.list(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["allTickets"],
    queryFn: () => base44.entities.Ticket.list(),
  });

  const { data: juryScores = [] } = useQuery({
    queryKey: ["allJuryScores"],
    queryFn: () => base44.entities.JuryScore.list(),
  });

  // Calculate metrics
  const metrics = {
    totalCases: cases.length,
    pendingCases: cases.filter(c => c.status === "pending").length,
    approvedCases: cases.filter(c => c.status === "approved").length,
    rejectedCases: cases.filter(c => c.status === "rejected").length,
    totalUsers: users.length,
    totalVotes: votes.length,
    totalTickets: tickets.filter(t => t.paid).length,
    revenue: tickets.filter(t => t.paid).reduce((sum, t) => sum + t.price, 0) / 100,
    avgJuryScore: juryScores.length > 0 
      ? (juryScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / juryScores.length).toFixed(1)
      : 0,
    evaluatedCases: new Set(juryScores.map(s => s.case_id)).size,
  };

  const statCards = [
    {
      title: "Casos Totales",
      value: metrics.totalCases,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      subtext: `${metrics.pendingCases} pendientes`,
      trend: metrics.pendingCases > 0 ? "warning" : "good"
    },
    {
      title: "Casos Aprobados",
      value: metrics.approvedCases,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      subtext: `${((metrics.approvedCases / metrics.totalCases) * 100 || 0).toFixed(0)}% tasa de aprobación`,
      trend: "good"
    },
    {
      title: "Usuarios",
      value: metrics.totalUsers,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      subtext: "Registrados",
      trend: "neutral"
    },
    {
      title: "Votos Emitidos",
      value: metrics.totalVotes,
      icon: Vote,
      color: "from-orange-500 to-red-500",
      subtext: `${(metrics.totalVotes / (metrics.totalUsers || 1)).toFixed(1)} votos/usuario`,
      trend: "good"
    },
    {
      title: "Evaluaciones Jurado",
      value: juryScores.length,
      icon: Award,
      color: "from-yellow-500 to-amber-500",
      subtext: `${metrics.evaluatedCases} casos evaluados`,
      trend: metrics.evaluatedCases > 0 ? "good" : "warning"
    },
    {
      title: "Puntuación Media",
      value: metrics.avgJuryScore,
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      subtext: "De 40 puntos máximo",
      trend: "neutral"
    },
    {
      title: "Tickets Vendidos",
      value: metrics.totalTickets,
      icon: Activity,
      color: "from-teal-500 to-green-500",
      subtext: `${tickets.length} creados`,
      trend: "good"
    },
    {
      title: "Ingresos",
      value: `€${metrics.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "from-[#C9A227] to-[#E8C547]",
      subtext: "Total recaudado",
      trend: "good"
    },
  ];

  const recentActivity = [
    {
      title: "Casos en revisión",
      count: metrics.pendingCases,
      icon: Clock,
      color: "text-yellow-400",
      action: "Revisar ahora"
    },
    {
      title: "Casos rechazados",
      count: metrics.rejectedCases,
      icon: XCircle,
      color: "text-red-400",
      action: "Ver motivos"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Dashboard Ejecutivo</h2>
          <p className="text-gray-400">Resumen de métricas clave y estado del evento</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <Calendar className="w-4 h-4 text-[#C9A227]" />
          <span className="text-white text-sm">Evento: 23 Oct 2026</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-white/[0.02] border-white/10 p-5 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.trend === "good" && (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                )}
                {stat.trend === "warning" && (
                  <Activity className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">{stat.title}</p>
                <p className="text-white text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.subtext}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card className="bg-white/[0.02] border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C9A227]" />
            Acciones Pendientes
          </h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.count} items</p>
                  </div>
                </div>
                <span className="text-[#C9A227] text-sm hover:underline cursor-pointer">
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white/[0.02] border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#C9A227]" />
            Resumen de Participación
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Tasa de aprobación</span>
                <span className="text-white font-semibold">
                  {((metrics.approvedCases / metrics.totalCases) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${(metrics.approvedCases / metrics.totalCases) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Participación votación</span>
                <span className="text-white font-semibold">
                  {((metrics.totalVotes / (metrics.approvedCases * metrics.totalUsers || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A227] to-[#E8C547] rounded-full"
                  style={{ 
                    width: `${Math.min(((metrics.totalVotes / (metrics.approvedCases * metrics.totalUsers || 1)) * 100), 100)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Casos evaluados</span>
                <span className="text-white font-semibold">
                  {((metrics.evaluatedCases / metrics.approvedCases) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(metrics.evaluatedCases / metrics.approvedCases) * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-white/[0.02] border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Base de datos</p>
            <p className="text-gray-500 text-xs">Operativa</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Autenticación</p>
            <p className="text-gray-500 text-xs">Activa</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Backups</p>
            <p className="text-gray-500 text-xs">Diarios (3:00 AM)</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Stripe</p>
            <p className="text-gray-500 text-xs">Modo test</p>
          </div>
        </div>
      </Card>
    </div>
  );
}