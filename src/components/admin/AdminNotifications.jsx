import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/components/NotificationService";

const NOTIFICATION_TYPES = [
  { key: "voting_start", label: "Inicio de Votación", description: "Notificar que la votación ha comenzado" },
  { key: "voting_end", label: "Cierre de Votación", description: "Recordar que la votación está por cerrar" },
  { key: "ticket_reminder", label: "Recordatorio de Pases", description: "Recordar compra de pases" },
  { key: "stream_start", label: "Inicio de Transmisión", description: "Notificar inicio de transmisión en vivo" },
  { key: "winner_announcement", label: "Anuncio de Ganadores", description: "Anunciar ganadores de categorías" },
];

export default function AdminNotifications() {
  const [sending, setSending] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (type) => {
      const notifiedUsers = await notificationService.getNotifiedUsers(type);
      
      switch (type) {
        case "voting_start":
          return await notificationService.sendVotingStartNotification(notifiedUsers);
        case "voting_end":
          return await notificationService.sendVotingEndNotification(notifiedUsers);
        case "ticket_reminder":
          return await notificationService.sendTicketReminderNotification(notifiedUsers);
        case "stream_start":
          return await notificationService.sendStreamStartNotification(notifiedUsers);
        default:
          throw new Error("Tipo de notificación no soportado");
      }
    },
    onSuccess: (result) => {
      toast.success(`Notificaciones enviadas: ${result.success} exitosas, ${result.failed} fallidas`);
      setSending(null);
      setSelectedType(null);
    },
    onError: (error) => {
      toast.error("Error al enviar notificaciones: " + error.message);
      setSending(null);
    },
  });

  const handleSendNotification = (type) => {
    setSending(type);
    sendNotificationMutation.mutate(type);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Sistema de Notificaciones</h3>
        <p className="text-sm text-gray-500">Envía notificaciones a usuarios basadas en sus preferencias</p>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_TYPES.map((type) => (
          <div key={type.key} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{type.label}</h4>
                <p className="text-gray-400 text-sm mb-3">{type.description}</p>
                
                {/* Count of users who have this enabled */}
                <div className="flex items-center gap-2">
                  {users.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {users.filter(u => u.notification_preferences?.[type.key] === true).length} usuario(s) recibirán
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleSendNotification(type.key)}
                disabled={sending || sendNotificationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              >
                {sending === type.key ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom notification section */}
      <div className="mt-8 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-[#C9A227]" />
          <h4 className="text-white font-semibold">Notificación Personalizada</h4>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Envía un mensaje personalizado a todos los usuarios que lo deseen
        </p>
        
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Asunto</Label>
            <Input
              placeholder="Asunto del email"
              className="bg-white/5 border-white/10 text-white"
              value={customMessage.subject || ""}
              onChange={(e) => setCustomMessage({ ...customMessage, subject: e.target.value })}
            />
          </div>
          
          <div>
            <Label className="text-gray-300 mb-2 block">Mensaje</Label>
            <Textarea
              placeholder="Contenido del mensaje"
              rows={4}
              className="bg-white/5 border-white/10 text-white"
              value={customMessage.body || ""}
              onChange={(e) => setCustomMessage({ ...customMessage, body: e.target.value })}
            />
          </div>

          <Button 
            className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
            disabled={!customMessage.subject || !customMessage.body}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensaje Personalizado
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Nota Importante:</p>
            <p>Las notificaciones solo se enviarán a usuarios que han habilitado este tipo de notificación en sus preferencias.</p>
          </div>
        </div>
      </div>
    </div>
  );
}