import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, FileText, Vote, Award, CheckCircle2, 
  XCircle, Clock, Loader2
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, subValue, color = "#c9a84c", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
    <div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {subValue && <p className="text-gray-500 text-xs mt-1">{subValue}</p>}
    </div>
  </motion.div>
);

export default function AdminAnalytics() {
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.Case.list(),
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery({
    queryKey: ["votes"],
    queryFn: () => base44.entities.Vote.list(),
  });

  const { data: finalists = [], isLoading: finalistsLoading } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.list(),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const isLoading = usersLoading || casesLoading || votesLoading || finalistsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  const pendingCases = cases.filter(c => c.status === "pending").length;
  const approvedCases = cases.filter(c => c.status === "approved").length;
  const rejectedCases = cases.filter(c => c.status === "rejected").length;
  const adminUsers = users.filter(u => u.role === "admin").length;

  // Top finalists
  const topFinalists = [...finalists]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  // Recent activity
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 3);

  // Vote distribution by category
  const votesByCategory = categories.map(cat => {
    const categoryVotes = votes.filter(v => v.category_id === cat.id).length;
    return { name: cat.name, votes: categoryVotes };
  }).sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-[#c9a84c]" />
        <h2 className="text-xl font-bold text-white">Análisis y métricas</h2>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total usuarios"
          value={users.length}
          subValue={`${adminUsers} administradores`}
          delay={0}
        />
        <StatCard
          icon={Vote}
          label="Total votos"
          value={votes.length}
          delay={0.05}
        />
        <StatCard
          icon={FileText}
          label="Casos enviados"
          value={cases.length}
          subValue={`${pendingCases} pendientes`}
          delay={0.1}
        />
        <StatCard
          icon={Award}
          label="Finalistas"
          value={finalists.length}
          subValue={`en ${categories.length} categorías`}
          delay={0.15}
        />
      </div>

      {/* Case Status Breakdown */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-white font-semibold mb-4">Estado de casos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-semibold text-2xl">{pendingCases}</p>
              <p className="text-gray-400 text-sm">Pendientes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-400 font-semibold text-2xl">{approvedCases}</p>
              <p className="text-gray-400 text-sm">Aprobados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-semibold text-2xl">{rejectedCases}</p>
              <p className="text-gray-400 text-sm">Rechazados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Finalists & Vote Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Finalists */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#c9a84c]" />
            Top 5 finalistas
          </h3>
          <div className="space-y-3">
            {topFinalists.map((finalist, i) => (
              <div key={finalist.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                <span className="text-gray-500 font-medium w-6">{i + 1}</span>
                <img
                  src={finalist.photo_url || `https://ui-avatars.com/api/?name=${finalist.name}&background=c9a84c&color=0a0e1a&size=40`}
                  alt={finalist.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{finalist.name}</p>
                  <p className="text-gray-500 text-xs">{finalist.category_name}</p>
                </div>
                <span className="text-[#c9a84c] font-semibold">{finalist.vote_count || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Distribution */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Vote className="w-5 h-5 text-[#c9a84c]" />
            Votos por categoría
          </h3>
          <div className="space-y-3">
            {votesByCategory.map((cat) => {
              const maxVotes = Math.max(...votesByCategory.map(c => c.votes), 1);
              const percentage = (cat.votes / maxVotes) * 100;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{cat.name}</span>
                    <span className="text-[#c9a84c] font-semibold text-sm">{cat.votes}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8d48b] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}