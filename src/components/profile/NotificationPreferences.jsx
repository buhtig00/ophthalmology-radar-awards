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
    key: "case_status_updates",
    title: "Actualizaciones de casos",
    description: "Notificaciones cuando tus casos sean revisados",
    icon: FileText,
  },
  {
    key: "voting_reminders",
    title: "Recordatorios de votación",
    description: "Recibe recordatorios para votar en categorías pendientes",
    icon: Vote,
  },
  {
    key: "finalist_announcements",
    title: "Anuncios de finalistas",
    description: "Notificaciones sobre nuevos finalistas",
    icon: Award,
  },
  {
    key: "event_updates",
    title: "Actualizaciones del evento",
    description: "Información importante sobre el evento",
    icon: Calendar,
  },
  {
    key: "newsletter",
    title: "Newsletter",
    description: "Recibe nuestro boletín con novedades",
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
      case_status_updates: true,
      voting_reminders: true,
      finalist_announcements: true,
      event_updates: true,
      newsletter: false,
    }
  );
  const [digestFrequency, setDigestFrequency] = useState(
    user?.notification_digest_frequency || "instant"
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
      notification_digest_frequency: digestFrequency
    });
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

      {/* Digest Frequency */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#c9a84c]" />
          Frecuencia de notificaciones
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Elige con qué frecuencia quieres recibir notificaciones por email
        </p>
        <Select value={digestFrequency} onValueChange={setDigestFrequency}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIGEST_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {digestFrequency === "daily" && (
          <p className="text-gray-500 text-xs mt-2">
            Recibirás un resumen diario con todas las notificaciones acumuladas
          </p>
        )}
        {digestFrequency === "weekly" && (
          <p className="text-gray-500 text-xs mt-2">
            Recibirás un resumen semanal cada lunes con todas las notificaciones
          </p>
        )}
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