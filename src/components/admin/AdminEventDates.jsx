import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminEventDates() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: async () => {
      const data = await base44.entities.EventConfig.list();
      if (data.length > 0) {
        setConfig(data[0]);
      }
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EventConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventConfig"] });
      toast.success("Fechas actualizadas correctamente");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EventConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventConfig"] });
      toast.success("Configuración creada correctamente");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      event_name: formData.get("event_name"),
      event_date: formData.get("event_date") ? new Date(formData.get("event_date")).toISOString() : null,
      call_open_date: formData.get("call_open_date") ? new Date(formData.get("call_open_date")).toISOString() : null,
      submission_deadline: formData.get("submission_deadline") ? new Date(formData.get("submission_deadline")).toISOString() : null,
      evaluation_start: formData.get("evaluation_start") ? new Date(formData.get("evaluation_start")).toISOString() : null,
      evaluation_end: formData.get("evaluation_end") ? new Date(formData.get("evaluation_end")).toISOString() : null,
      voting_start: formData.get("voting_start") ? new Date(formData.get("voting_start")).toISOString() : null,
      voting_end: formData.get("voting_end") ? new Date(formData.get("voting_end")).toISOString() : null,
      voting_open: formData.get("voting_open") === "on",
      show_rankings: formData.get("show_rankings") === "on",
    };

    if (config) {
      updateMutation.mutate({ id: config.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Cargando configuración...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Fechas del Evento</h3>
        <p className="text-sm text-gray-500">Configura las fechas clave del proceso</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="space-y-6">
          {/* Event Name */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C9A227]" />
              Información General
            </h4>
            <div>
              <Label className="text-gray-300">Nombre del evento</Label>
              <Input
                name="event_name"
                defaultValue={config?.event_name || "Óscars de Ophthalmology Radar 2026"}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Key Dates */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h4 className="text-white font-semibold mb-4">Fechas Clave</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Apertura convocatoria</Label>
                <Input
                  name="call_open_date"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.call_open_date)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Cierre envío de casos</Label>
                <Input
                  name="submission_deadline"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.submission_deadline)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Inicio evaluación jurado</Label>
                <Input
                  name="evaluation_start"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.evaluation_start)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Fin evaluación jurado</Label>
                <Input
                  name="evaluation_end"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.evaluation_end)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Inicio votación pública</Label>
                <Input
                  name="voting_start"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.voting_start)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Cierre votación pública</Label>
                <Input
                  name="voting_end"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.voting_end)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-300">Fecha de la gala</Label>
                <Input
                  name="event_date"
                  type="datetime-local"
                  defaultValue={formatDateForInput(config?.event_date)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h4 className="text-white font-semibold mb-4">Configuración</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="voting_open"
                  name="voting_open"
                  defaultChecked={config?.voting_open ?? true}
                  className="w-4 h-4"
                />
                <Label htmlFor="voting_open" className="text-gray-300">
                  Votación abierta (permitir votar actualmente)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show_rankings"
                  name="show_rankings"
                  defaultChecked={config?.show_rankings ?? true}
                  className="w-4 h-4"
                />
                <Label htmlFor="show_rankings" className="text-gray-300">
                  Mostrar rankings públicamente
                </Label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
}