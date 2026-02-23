import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Loader2 } from "lucide-react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminCases from "@/components/admin/AdminCases";
import AdminFinalists from "@/components/admin/AdminFinalists";
import AdminEmailLogs from "@/components/admin/AdminEmailLogs";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminJury from "@/components/admin/AdminJury";
import AdminPartners from "@/components/admin/AdminPartners";
import AdminEventDates from "@/components/admin/AdminEventDates";
import AdminExport from "@/components/admin/AdminExport";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto text-center py-20">
        <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Acceso restringido</h2>
        <p className="text-gray-400">Solo administradores pueden acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-7 h-7 text-[#c9a84c]" />
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        </div>
        <p className="text-gray-400">Gestiona usuarios, casos, finalistas y analiza métricas</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 w-full overflow-x-auto flex">
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Análisis
          </TabsTrigger>
          <TabsTrigger 
            value="dates"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Fechas
          </TabsTrigger>
          <TabsTrigger 
            value="categories"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Categorías
          </TabsTrigger>
          <TabsTrigger 
            value="cases"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Casos
          </TabsTrigger>
          <TabsTrigger 
            value="finalists"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Finalistas
          </TabsTrigger>
          <TabsTrigger 
            value="jury"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Jurado
          </TabsTrigger>
          <TabsTrigger 
            value="partners"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Partners
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Usuarios
          </TabsTrigger>
          <TabsTrigger 
            value="export"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Exportar
          </TabsTrigger>
          <TabsTrigger 
            value="emails"
            className="data-[state=active]:bg-[#C9A227] data-[state=active]:text-black whitespace-nowrap"
          >
            Emails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="dates">
          <AdminEventDates />
        </TabsContent>

        <TabsContent value="categories">
          <AdminCategories />
        </TabsContent>

        <TabsContent value="cases">
          <AdminCases />
        </TabsContent>

        <TabsContent value="finalists">
          <AdminFinalists />
        </TabsContent>

        <TabsContent value="jury">
          <AdminJury />
        </TabsContent>

        <TabsContent value="partners">
          <AdminPartners />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="export">
          <AdminExport />
        </TabsContent>

        <TabsContent value="emails">
          <AdminEmailLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}