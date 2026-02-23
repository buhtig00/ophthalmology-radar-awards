import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const NOTIFICATION_OPTIONS = [
  {
    key: "email_voting_reminders",
    title: "Recordatorios de votación",
    description: "Recibe recordatorios para votar antes de que cierre la votación",
    icon: Mail,
  },
  {
    key: "email_case_updates",
    title: "Actualizaciones de casos",
    description: "Notificaciones sobre el estado de tus casos clínicos enviados",
    icon: Mail,
  },
  {
    key: "email_event_updates",
    title: "Novedades del evento",
    description: "Información importante sobre los premios y la ceremonia",
    icon: Mail,
  },
  {
    key: "email_finalist_announcements",
    title: "Anuncios de finalistas",
    description: "Notificaciones cuando se añaden nuevos finalistas",
    icon: Mail,
  },
];

export default function NotificationPreferences({ user }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(
    user.notification_preferences || {
      email_voting_reminders: true,
      email_case_updates: true,
      email_event_updates: true,
      email_finalist_announcements: true,
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe({ notification_preferences: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Preferencias actualizadas");
    },
    onError: () => {
      toast.error("Error al actualizar preferencias");
    },
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(preferences);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <Bell className="w-6 h-6 text-[#c9a84c]" />
        <div>
          <h3 className="text-white font-semibold text-lg">Notificaciones por Email</h3>
          <p className="text-gray-400 text-sm">Configura cómo quieres recibir notificaciones</p>
        </div>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map((option, i) => {
          const Icon = option.icon;
          const isEnabled = preferences[option.key];
          
          return (
            <motion.div
              key={option.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-lg ${isEnabled ? "bg-[#c9a84c]/10" : "bg-white/5"}`}>
                    <Icon className={`w-5 h-5 ${isEnabled ? "text-[#c9a84c]" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{option.title}</h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? "bg-[#c9a84c]" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/5">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Preferencias
            </>
          )}
        </Button>
      </div>
    </div>
  );
}