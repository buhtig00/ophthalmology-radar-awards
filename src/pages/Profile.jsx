import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Vote, Bell, Loader2 } from "lucide-react";
import ProfileInfo from "@/components/profile/ProfileInfo";
import CasesHistory from "@/components/profile/CasesHistory";
import VotingHistory from "@/components/profile/VotingHistory";
import NotificationPreferences from "@/components/profile/NotificationPreferences";

export default function Profile() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
        throw error;
      }
    },
    enabled: mounted,
  });

  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Gestiona tu información personal, casos y preferencias</p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/5 flex-wrap h-auto">
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400"
          >
            <User className="w-4 h-4 mr-2" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger
            value="cases"
            className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400"
          >
            <FileText className="w-4 h-4 mr-2" />
            Mis Casos
          </TabsTrigger>
          <TabsTrigger
            value="votes"
            className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400"
          >
            <Vote className="w-4 h-4 mr-2" />
            Mis Votos
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] text-gray-400"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <TabsContent value="info" className="mt-0">
            <ProfileInfo user={user} />
          </TabsContent>

          <TabsContent value="cases" className="mt-0">
            <CasesHistory user={user} />
          </TabsContent>

          <TabsContent value="votes" className="mt-0">
            <VotingHistory user={user} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationPreferences user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}