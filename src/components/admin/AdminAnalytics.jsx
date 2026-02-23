import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  TrendingUp, Users, FileText, Vote, Award, CheckCircle2, 
  XCircle, Clock, Loader2, Download, Eye, MousePointer, Globe,
  Ticket, CreditCard, Calendar, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { format, parseISO, startOfWeek, eachDayOfInterval, subDays } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = ["#C9A227", "#E8C547", "#9A7A1F", "#F4E8B3", "#6B5A1A", "#D4B942"];

const StatCard = ({ icon: Icon, label, value, subValue, color = "#C9A227", delay = 0, trend }) => (
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
      {trend && (
        <div className={`text-xs font-semibold px-2 py-1 rounded ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {subValue && <p className="text-gray-500 text-xs mt-1">{subValue}</p>}
    </div>
  </motion.div>
);

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(null, 5000),
  });

  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.Case.list(null, 5000),
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery({
    queryKey: ["votes"],
    queryFn: () => base44.entities.Vote.list(null, 10000),
    staleTime: 5 * 60 * 1000,
  });

  const { data: finalists = [], isLoading: finalistsLoading } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.list(null, 1000),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["allTickets"],
    queryFn: () => base44.entities.Ticket.list(null, 5000),
    staleTime: 5 * 60 * 1000,
  });

  const { data: juryScores = [], isLoading: juryScoresLoading } = useQuery({
    queryKey: ["juryScores"],
    queryFn: () => base44.entities.JuryScore.list(null, 5000),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = usersLoading || casesLoading || votesLoading || finalistsLoading || categoriesLoading || ticketsLoading || juryScoresLoading;

  // Calculations
  const paidTickets = tickets.filter(t => t.paid);
  const streamingTickets = paidTickets.filter(t => t.type === "streaming");
  const vipTickets = paidTickets.filter(t => t.type === "vip");
  const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.price || 0), 0);

  const pendingCases = cases.filter(c => c.status === "pending").length;
  const approvedCases = cases.filter(c => c.status === "approved").length;
  const rejectedCases = cases.filter(c => c.status === "rejected").length;
  const adminUsers = users.filter(u => u.role === "admin").length;

  // Geographic distribution (from user emails - simplified)
  const getCountryFromUser = (user) => {
    // In real app, this would be from user profile data
    const countries = user.country || "España";
    return countries;
  };

  const countryDistribution = users.reduce((acc, user) => {
    const country = getCountryFromUser(user);
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Timeline data - last 14 days
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });

  const dailyData = last14Days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayVotes = votes.filter(v => format(parseISO(v.created_date), "yyyy-MM-dd") === dayStr).length;
    const dayCases = cases.filter(c => format(parseISO(c.created_date), "yyyy-MM-dd") === dayStr).length;
    const dayTickets = paidTickets.filter(t => t.paid_at && format(parseISO(t.paid_at), "yyyy-MM-dd") === dayStr).length;
    
    return {
      date: format(day, "dd MMM", { locale: es }),
      votos: dayVotes,
      casos: dayCases,
      tickets: dayTickets
    };
  });

  // Ticket sales trend
  const ticketSalesData = paidTickets.reduce((acc, ticket) => {
    if (!ticket.paid_at) return acc;
    const date = format(parseISO(ticket.paid_at), "dd MMM", { locale: es });
    const existing = acc.find(d => d.date === date);
    const revenue = (ticket.price || 0) / 100;
    
    if (existing) {
      existing.streaming += ticket.type === "streaming" ? 1 : 0;
      existing.vip += ticket.type === "vip" ? 1 : 0;
      existing.ingresos += revenue;
    } else {
      acc.push({
        date,
        streaming: ticket.type === "streaming" ? 1 : 0,
        vip: ticket.type === "vip" ? 1 : 0,
        ingresos: revenue
      });
    }
    return acc;
  }, []).slice(-14);

  // Vote distribution by category
  const votesByCategory = categories.map(cat => {
    const categoryVotes = votes.filter(v => v.category_id === cat.id).length;
    return { name: cat.name, votes: categoryVotes };
  }).sort((a, b) => b.votes - a.votes);

  // Cases by category
  const casesByCategory = categories.map(cat => {
    const categoryCases = cases.filter(c => c.category_id === cat.id).length;
    return { name: cat.name, count: categoryCases };
  }).sort((a, b) => b.count - a.count);

  // Cases by hospital
  const hospitalDistribution = cases.reduce((acc, c) => {
    if (c.hospital) {
      acc[c.hospital] = (acc[c.hospital] || 0) + 1;
    }
    return acc;
  }, {});
  const casesByHospital = Object.entries(hospitalDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Cases by country
  const countryDistributionCases = cases.reduce((acc, c) => {
    if (c.country) {
      acc[c.country] = (acc[c.country] || 0) + 1;
    }
    return acc;
  }, {});
  const casesByCountry = Object.entries(countryDistributionCases)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Jury performance by criteria
  const juryPerformance = [
    {
      criteria: "Innovación",
      average: juryScores.reduce((sum, s) => sum + (s.innovation_score || 0), 0) / juryScores.length || 0,
      max: 10
    },
    {
      criteria: "Impacto Clínico",
      average: juryScores.reduce((sum, s) => sum + (s.clinical_impact_score || 0), 0) / juryScores.length || 0,
      max: 10
    },
    {
      criteria: "Calidad Presentación",
      average: juryScores.reduce((sum, s) => sum + (s.presentation_quality_score || 0), 0) / juryScores.length || 0,
      max: 10
    },
    {
      criteria: "Valor Docente",
      average: juryScores.reduce((sum, s) => sum + (s.teaching_value_score || 0), 0) / juryScores.length || 0,
      max: 10
    }
  ];

  // Top cases by votes
  const topCasesByVotes = [...cases]
    .filter(c => c.vote_count > 0)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 10);

  // Top cases by average jury score
  const caseScores = cases.map(c => {
    const scores = juryScores.filter(s => s.case_id === c.id);
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + (s.total_score || 0), 0) / scores.length
      : 0;
    return { ...c, avgScore, scoreCount: scores.length };
  });
  const topCasesByScore = caseScores
    .filter(c => c.scoreCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  // Case status distribution
  const caseStatusData = [
    { name: "Pendientes", value: pendingCases, color: "#EAB308" },
    { name: "Aprobados", value: approvedCases, color: "#22C55E" },
    { name: "Rechazados", value: rejectedCases, color: "#EF4444" },
    { name: "Finalistas", value: cases.filter(c => c.status === "finalist").length, color: "#C9A227" }
  ];

  // Top finalists
  const topFinalists = [...finalists]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      ["Métrica", "Valor"],
      ["Total Usuarios", users.length],
      ["Total Votos", votes.length],
      ["Total Casos", cases.length],
      ["Casos Pendientes", pendingCases],
      ["Casos Aprobados", approvedCases],
      ["Casos Rechazados", rejectedCases],
      ["Total Tickets", paidTickets.length],
      ["Tickets Streaming", streamingTickets.length],
      ["Tickets VIP", vipTickets.length],
      ["Ingresos Totales (€)", (totalRevenue / 100).toFixed(2)],
      [""],
      ["Top Países"],
      ["País", "Usuarios"],
      ...topCountries.map(c => [c.name, c.count]),
      [""],
      ["Top Finalistas"],
      ["Nombre", "Votos"],
      ...topFinalists.map(f => [f.name, f.vote_count || 0])
    ];

    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById("analytics-content");
      const canvas = await html2canvas(element, { backgroundColor: "#0a0e1a" });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[#C9A227]" />
          <h2 className="text-xl font-bold text-white">Analíticas Avanzadas</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            size="sm"
            className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
            onClick={exportToPDF}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            PDF
          </Button>
        </div>
      </div>

      <div id="analytics-content">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 p-1 w-full overflow-x-auto flex">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              General
            </TabsTrigger>
            <TabsTrigger value="voting" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              Votación
            </TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              Casos
            </TabsTrigger>
            <TabsTrigger value="jury" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              Jurado
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black">
              Geografía
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                color="#22C55E"
                delay={0.05}
              />
              <StatCard
                icon={FileText}
                label="Casos enviados"
                value={cases.length}
                subValue={`${pendingCases} pendientes`}
                color="#3B82F6"
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

            {/* Activity Timeline */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                Actividad - Últimos 14 días
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorVotos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="votos" stroke="#C9A227" fillOpacity={1} fill="url(#colorVotos)" />
                  <Area type="monotone" dataKey="casos" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCasos)" />
                  <Area type="monotone" dataKey="tickets" stroke="#22C55E" fillOpacity={0.6} fill="#22C55E20" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Case Status & Top Finalists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Status Pie Chart */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#C9A227]" />
                  Distribución de casos
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={caseStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {caseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Finalists */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C9A227]" />
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
                      <span className="text-[#C9A227] font-semibold">{finalist.vote_count || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Vote}
                label="Total votos"
                value={votes.length}
                subValue={`${(votes.length / users.length).toFixed(1)} por usuario`}
                color="#22C55E"
              />
              <StatCard
                icon={TrendingUp}
                label="Tasa de participación"
                value={`${Math.round((votes.length / cases.filter(c => c.status === 'approved').length) * 100)}%`}
                color="#8B5CF6"
              />
              <StatCard
                icon={BarChart3}
                label="Promedio votos/caso"
                value={(votes.length / cases.filter(c => c.status === 'approved').length || 1).toFixed(1)}
                color="#3B82F6"
              />
            </div>

            {/* Voting Trends Over Time */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C9A227]" />
                Tendencia de votación - Últimos 14 días
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="votos" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Votes by Category */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#C9A227]" />
                Votos por categoría
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={votesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Bar dataKey="votes" fill="#C9A227" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Cases by Votes */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C9A227]" />
                Top 10 casos con más votos
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left text-gray-400 font-medium py-3 px-2">#</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Caso</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Categoría</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Hospital</th>
                      <th className="text-right text-gray-400 font-medium py-3 px-4">Votos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCasesByVotes.slice(0, 10).map((caseItem, i) => (
                      <tr key={caseItem.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                        <td className="py-2 px-4 text-white truncate">{caseItem.title}</td>
                        <td className="py-2 px-4 text-gray-400 truncate">{caseItem.category_name}</td>
                        <td className="py-2 px-4 text-gray-400 truncate">{caseItem.hospital || 'N/A'}</td>
                        <td className="py-2 px-4 text-right">
                          <span className="text-[#C9A227] font-semibold">{caseItem.vote_count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={FileText}
                label="Total casos"
                value={cases.length}
                color="#3B82F6"
              />
              <StatCard
                icon={CheckCircle2}
                label="Casos aprobados"
                value={approvedCases}
                subValue={`${((approvedCases / cases.length) * 100).toFixed(1)}% del total`}
                color="#22C55E"
              />
              <StatCard
                icon={Clock}
                label="Casos pendientes"
                value={pendingCases}
                color="#EAB308"
              />
            </div>

            {/* Cases by Category */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#C9A227]" />
                Distribución de casos por categoría
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={casesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cases by Hospital and Country */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Hospital */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                  Top 10 hospitales
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={casesByHospital} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* By Country */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C9A227]" />
                  Casos por país
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={casesByCountry}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {casesByCountry.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Jury Tab */}
          <TabsContent value="jury" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Users}
                label="Total evaluaciones"
                value={juryScores.length}
                color="#8B5CF6"
              />
              <StatCard
                icon={Award}
                label="Casos evaluados"
                value={new Set(juryScores.map(s => s.case_id)).size}
                color="#3B82F6"
              />
              <StatCard
                icon={BarChart3}
                label="Puntuación promedio"
                value={(juryScores.reduce((sum, s) => sum + (s.total_score || 0), 0) / juryScores.length || 0).toFixed(1)}
                subValue="de 40 puntos"
                color="#22C55E"
              />
            </div>

            {/* Jury Performance by Criteria */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                Rendimiento promedio del jurado por criterio
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={juryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="criteria" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="average" fill="#C9A227" name="Promedio" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {juryPerformance.map((criteria, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-gray-400 text-xs mb-1">{criteria.criteria}</p>
                    <p className="text-white text-xl font-bold">{criteria.average.toFixed(2)}/10</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cases by Average Score */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C9A227]" />
                Top 10 casos con mejor puntuación promedio
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left text-gray-400 font-medium py-3 px-2">#</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Caso</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Categoría</th>
                      <th className="text-left text-gray-400 font-medium py-3 px-4">Hospital</th>
                      <th className="text-center text-gray-400 font-medium py-3 px-4">Evaluaciones</th>
                      <th className="text-right text-gray-400 font-medium py-3 px-4">Puntuación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCasesByScore.slice(0, 10).map((caseItem, i) => (
                      <tr key={caseItem.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                        <td className="py-2 px-4 text-white truncate">{caseItem.title}</td>
                        <td className="py-2 px-4 text-gray-400 truncate">{caseItem.category_name}</td>
                        <td className="py-2 px-4 text-gray-400 truncate">{caseItem.hospital || 'N/A'}</td>
                        <td className="py-2 px-4 text-center text-gray-400">{caseItem.scoreCount}</td>
                        <td className="py-2 px-4 text-right">
                          <span className="text-[#C9A227] font-semibold">{caseItem.avgScore.toFixed(2)}/40</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Engagement Tab (kept for backwards compatibility) */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={MousePointer}
                label="Interacciones totales"
                value={votes.length + cases.length}
                color="#8B5CF6"
              />
              <StatCard
                icon={Eye}
                label="Casos visualizados"
                value={cases.length}
                subValue="Promedio por usuario"
                color="#3B82F6"
              />
              <StatCard
                icon={Vote}
                label="Tasa de participación"
                value={`${Math.round((votes.length / users.length) * 100)}%`}
                subValue={`${(votes.length / users.length).toFixed(1)} votos/usuario`}
                color="#22C55E"
              />
            </div>

            {/* Votes by Category Bar Chart */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#C9A227]" />
                Votos por categoría
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={votesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Bar dataKey="votes" fill="#C9A227" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatCard
                icon={Ticket}
                label="Total tickets vendidos"
                value={paidTickets.length}
                color="#3B82F6"
              />
              <StatCard
                icon={Ticket}
                label="Tickets Streaming"
                value={streamingTickets.length}
                color="#8B5CF6"
              />
              <StatCard
                icon={Ticket}
                label="Tickets VIP"
                value={vipTickets.length}
                color="#C9A227"
              />
              <StatCard
                icon={CreditCard}
                label="Ingresos totales"
                value={`€${(totalRevenue / 100).toFixed(0)}`}
                subValue={`€${(totalRevenue / 100 / paidTickets.length || 0).toFixed(2)} promedio`}
                color="#22C55E"
              />
            </div>

            {/* Ticket Sales Trend */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                Tendencia de ventas
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={ticketSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="streaming" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="vip" stroke="#C9A227" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C9A227]" />
                Distribución geográfica de usuarios
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCountries} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="name" type="category" stroke="#666" width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#C9A227" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Country Distribution Table */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold mb-4">Top países por usuarios</h3>
              <div className="space-y-2">
                {topCountries.map((country, idx) => {
                  const percentage = (country.count / users.length) * 100;
                  return (
                    <div key={country.name} className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium w-6">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-white text-sm">{country.name}</span>
                          <span className="text-gray-400 text-sm">{country.count} usuarios ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A227] to-[#E8C547]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}