import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, FileText, Award } from "lucide-react";
import AdminCases from "@/components/admin/AdminCases";
import AdminFinalists from "@/components/admin/AdminFinalists";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <Settings className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Acceso restringido</h2>
        <p className="text-gray-500">Solo los administradores pueden acceder a este panel.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-gray-400">Gestiona casos clínicos, finalistas y configuración</p>
      </div>

      <Tabs defaultValue="cases">
        <TabsList className="bg-white/5 border border-white/5 mb-6">
          <TabsTrigger value="cases" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400">
            <FileText className="w-4 h-4 mr-2" /> Casos
          </TabsTrigger>
          <TabsTrigger value="finalists" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400">
            <Award className="w-4 h-4 mr-2" /> Finalistas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cases">
          <AdminCases />
        </TabsContent>
        <TabsContent value="finalists">
          <AdminFinalists />
        </TabsContent>
      </Tabs>
    </div>
  );
}