import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Clock, Award, Vote, Video, FileText, Send, Check, Loader2, ExternalLink } from "lucide-react";
import { format, parseISO, isBefore, isAfter, isToday } from "date-fns";
import { es } from "date-fns/locale";

const EVENT_TYPES = {
  call_open_date: {
    icon: FileText,
    label: "Apertura de Convocatoria",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description: "Comienza el periodo de envío de casos clínicos"
  },
  submission_deadline: {
    icon: Send,
    label: "Cierre de Envío de Casos",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    description: "Último día para enviar casos clínicos"
  },
  evaluation_start: {
    icon: Check,
    label: "Inicio de Evaluación",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description: "El jurado comienza a evaluar los casos"
  },
  evaluation_end: {
    icon: Check,
    label: "Fin de Evaluación",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description: "El jurado finaliza la evaluación de casos"
  },
  voting_start: {
    icon: Vote,
    label: "Inicio de Votación Pública",
    color: "text-green-400",
    bg: "bg-green-500/10",
    description: "Comienza el periodo de votación pública"
  },
  voting_end: {
    icon: Vote,
    label: "Cierre de Votación",
    color: "text-red-400",
    bg: "bg-red-500/10",
    description: "Último día para votar"
  },
  event_date: {
    icon: Award,
    label: "Gala de Premios",
    color: "text-[#C9A227]",
    bg: "bg-[#C9A227]/10",
    description: "Ceremonia de entrega de premios y transmisión en vivo"
  }
};

function generateICS(eventName, eventDate, description, eventTitle) {
  const start = new Date(eventDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ophthalmology Radar Awards//Calendar//ES
BEGIN:VEVENT
UID:${eventName}-${Date.now()}@ophthalmologyradar.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${eventTitle}
DESCRIPTION:${description}
LOCATION:Ophthalmology Radar Awards 2026
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return ics;
}

function downloadICS(filename, icsContent) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addToGoogleCalendar(eventDate, eventTitle, description) {
  const start = new Date(eventDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${start}/${start}&details=${encodeURIComponent(description)}&location=Ophthalmology+Radar+Awards+2026`;
  window.open(url, '_blank');
}

export default function EventCalendar() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: async () => {
      const configs = await base44.entities.EventConfig.list();
      return configs[0] || {};
    },
  });

  const events = config ? Object.entries(EVENT_TYPES)
    .filter(([key]) => config[key])
    .map(([key, details]) => ({
      key,
      date: config[key],
      ...details
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)) : [];

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    
    if (isToday(eventDate)) return "today";
    if (isBefore(eventDate, now)) return "past";
    return "upcoming";
  };

  const downloadAllEvents = () => {
    let allICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ophthalmology Radar Awards//Calendar//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Ophthalmology Radar Awards 2026
X-WR-TIMEZONE:Europe/Madrid
`;

    events.forEach(event => {
      const start = new Date(event.date);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      allICS += `BEGIN:VEVENT
UID:${event.key}-${Date.now()}@ophthalmologyradar.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.label}
DESCRIPTION:${event.description}
LOCATION:Ophthalmology Radar Awards 2026
STATUS:CONFIRMED
END:VEVENT
`;
    });

    allICS += `END:VCALENDAR`;
    downloadICS('ophthalmology-radar-awards-2026.ics', allICS);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-[#C9A227]" />
          <h1 className="text-3xl font-bold text-white">Calendario del Evento</h1>
        </div>
        <p className="text-gray-400">
          Todas las fechas clave del Ophthalmology Radar Awards 2026
        </p>
      </div>

      {/* Download All Button */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={downloadAllEvents}
          className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Todas las Fechas (.ics)
        </Button>
        <p className="text-gray-500 text-sm flex items-center">
          Compatible con Google Calendar, Outlook, Apple Calendar y más
        </p>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {events.map((event, idx) => {
          const Icon = event.icon;
          const status = getEventStatus(event.date);
          const dateObj = parseISO(event.date);

          return (
            <div
              key={event.key}
              className={`relative p-6 rounded-2xl border transition-all ${
                status === "today"
                  ? "border-[#C9A227] bg-[#C9A227]/5"
                  : status === "past"
                  ? "border-white/5 bg-white/[0.01] opacity-60"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${event.bg} flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${event.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {event.label}
                      </h3>
                      <p className="text-gray-400 text-sm">{event.description}</p>
                    </div>
                    {status === "today" && (
                      <Badge className="bg-[#C9A227] text-black font-semibold">
                        Hoy
                      </Badge>
                    )}
                    {status === "past" && (
                      <Badge variant="outline" className="border-white/10 text-gray-500">
                        Pasado
                      </Badge>
                    )}
                    {status === "upcoming" && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Próximo
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-medium">
                      {format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">
                      {format(dateObj, "HH:mm")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => {
                        const ics = generateICS(event.key, event.date, event.description, event.label);
                        downloadICS(`${event.key}.ics`, ics);
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      .ics
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => addToGoogleCalendar(event.date, event.label, event.description)}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Google Calendar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Timeline connector */}
              {idx < events.length - 1 && (
                <div className="absolute left-[42px] top-[84px] w-0.5 h-8 bg-gradient-to-b from-white/10 to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-1">Sincronización Automática</h4>
            <p className="text-gray-400 text-sm">
              Al añadir los eventos a tu calendario personal, recibirás notificaciones automáticas según 
              tus preferencias configuradas en tu perfil. Puedes gestionar qué notificaciones recibir desde 
              la sección "Mi Perfil".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}