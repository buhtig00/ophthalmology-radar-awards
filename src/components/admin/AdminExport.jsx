import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function AdminExport() {
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.Case.list(),
  });

  const { data: votes = [] } = useQuery({
    queryKey: ["votes"],
    queryFn: () => base44.entities.Vote.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: finalists = [] } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.list(),
  });

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} descargado correctamente`);
  };

  const exportCases = () => {
    const casesData = cases.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category_name || "",
      hospital: c.hospital || "",
      country: c.country || "",
      status: c.status,
      created_by: c.created_by,
      created_date: c.created_date,
    }));
    exportToCSV(casesData, "casos_clinicos.csv");
  };

  const exportVotes = () => {
    const votesData = votes.map(v => ({
      id: v.id,
      finalist_name: v.finalist_name,
      category_name: v.category_name,
      voter_email: v.created_by,
      created_date: v.created_date,
    }));
    exportToCSV(votesData, "votos.csv");
  };

  const exportUsers = () => {
    const usersData = users.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      created_date: u.created_date,
    }));
    exportToCSV(usersData, "usuarios.csv");
  };

  const exportFinalists = () => {
    const finalistsData = finalists.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category_name,
      hospital: f.hospital || "",
      country: f.country || "",
      vote_count: f.vote_count || 0,
      specialty: f.specialty || "",
    }));
    exportToCSV(finalistsData, "finalistas.csv");
  };

  const exportAll = () => {
    exportCases();
    setTimeout(() => exportVotes(), 300);
    setTimeout(() => exportUsers(), 600);
    setTimeout(() => exportFinalists(), 900);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Exportar Datos</h3>
        <p className="text-sm text-gray-500">Descarga los datos en formato CSV</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        <ExportCard
          title="Casos Clínicos"
          description={`${cases.length} casos registrados`}
          onClick={exportCases}
        />
        <ExportCard
          title="Votos"
          description={`${votes.length} votos emitidos`}
          onClick={exportVotes}
        />
        <ExportCard
          title="Usuarios"
          description={`${users.length} usuarios registrados`}
          onClick={exportUsers}
        />
        <ExportCard
          title="Finalistas"
          description={`${finalists.length} finalistas`}
          onClick={exportFinalists}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <Button
            onClick={exportAll}
            size="lg"
            className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold h-16"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Todo
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExportCard({ title, description, onClick }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
      <FileSpreadsheet className="w-8 h-8 text-[#C9A227] mb-3" />
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button
        onClick={onClick}
        size="sm"
        variant="outline"
        className="w-full border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227]/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Descargar CSV
      </Button>
    </div>
  );
}