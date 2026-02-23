import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Save, Loader2, FileText, Vote, Award, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const NOTIFICATION_OPTIONS = [
  {
    key: "voting_start",
    title: "Inicio de votación",
    description: "Notificación cuando comienza la votación pública",
    icon: Vote,
  },
  {
    key: "voting_end",
    title: "Cierre de votación",
    description: "Recordatorio cuando se va a cerrar la votación",
    icon: Vote,
  },
  {
    key: "ticket_reminder",
    title: "Recordatorio de compra de pases",
    description: "Recordatorios para comprar tu pase de acceso",
    icon: Award,
  },
  {
    key: "stream_start",
    title: "Inicio de transmisión",
    description: "Notificación cuando comience la transmisión en vivo",
    icon: Calendar,
  },
  {
    key: "winner_announcement",
    title: "Anuncio de ganadores",
    description: "Notificaciones con los ganadores de cada categoría",
    icon: Mail,
  },
];

const DIGEST_OPTIONS = [
  { value: "instant", label: "Inmediato" },
  { value: "daily", label: "Resumen diario" },
  { value: "weekly", label: "Resumen semanal" },
];

export default function NotificationPreferences({ user }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(
    user?.notification_preferences || {
      voting_start: true,
      voting_end: true,
      ticket_reminder: true,
      stream_start: true,
      winner_announcement: true,
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
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
    updateMutation.mutate({ 
      notification_preferences: preferences,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <Bell className="w-6 h-6 text-[#C9A227]" />
        <div>
          <h3 className="text-white font-semibold text-lg">Notificaciones por Email</h3>
          <p className="text-gray-400 text-sm">Configura cómo quieres recibir notificaciones</p>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold">Tipos de notificaciones</h3>
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
                  <div className={`p-2.5 rounded-lg ${isEnabled ? "bg-[#C9A227]/10" : "bg-white/5"}`}>
                    <Icon className={`w-5 h-5 ${isEnabled ? "text-[#C9A227]" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{option.title}</h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? "bg-[#C9A227]" : "bg-white/10"
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
          className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
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