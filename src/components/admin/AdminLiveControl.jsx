import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Trash2, Plus, Eye, EyeOff, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function AdminLiveControl() {
  const queryClient = useQueryClient();

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: () => base44.entities.LiveAnnouncement.list("-created_date"),
  });

  // Fetch recent messages
  const { data: messages = [] } = useQuery({
    queryKey: ["adminLiveMessages"],
    queryFn: () => base44.entities.LiveMessage.list("-created_date", 50),
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.LiveAnnouncement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      queryClient.invalidateQueries({ queryKey: ["liveAnnouncements"] });
      toast.success("Anuncio creado");
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.LiveAnnouncement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      queryClient.invalidateQueries({ queryKey: ["liveAnnouncements"] });
      toast.success("Anuncio actualizado");
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveAnnouncement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      queryClient.invalidateQueries({ queryKey: ["liveAnnouncements"] });
      toast.success("Anuncio eliminado");
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLiveMessages"] });
      queryClient.invalidateQueries({ queryKey: ["liveMessages"] });
      toast.success("Mensaje eliminado");
    },
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    type: "info",
    category_name: "",
    winner_name: "",
    is_active: true,
  });

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    createAnnouncementMutation.mutate(newAnnouncement);
    setNewAnnouncement({
      title: "",
      description: "",
      type: "info",
      category_name: "",
      winner_name: "",
      is_active: true,
    });
  };

  const toggleAnnouncementVisibility = (announcement) => {
    updateAnnouncementMutation.mutate({
      id: announcement.id,
      data: { ...announcement, is_active: !announcement.is_active },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Control del Evento en Vivo
        </h2>
        <p className="text-gray-400">
          Gestiona anuncios de ganadores y modera el chat
        </p>
      </div>

      <Tabs defaultValue="announcements">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="announcements">Anuncios</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-6">
          {/* Create new announcement */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-white font-semibold">Nuevo Anuncio</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Tipo de anuncio</Label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(value) =>
                      setNewAnnouncement({ ...newAnnouncement, type: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winner">🏆 Ganador</SelectItem>
                      <SelectItem value="milestone">⭐ Momento Clave</SelectItem>
                      <SelectItem value="info">ℹ️ Información</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Título</Label>
                  <Input
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ej: Mejor Cirugía de Catarata"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {newAnnouncement.type === "winner" && (
                  <>
                    <div>
                      <Label className="text-gray-300">
                        Nombre de la categoría
                      </Label>
                      <Input
                        value={newAnnouncement.category_name}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            category_name: e.target.value,
                          })
                        }
                        placeholder="Mejor Cirugía de Catarata Compleja"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Nombre del ganador</Label>
                      <Input
                        value={newAnnouncement.winner_name}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            winner_name: e.target.value,
                          })
                        }
                        placeholder="Dr. Juan Pérez"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-gray-300">Descripción</Label>
                  <Textarea
                    value={newAnnouncement.description}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción adicional..."
                    className="bg-white/5 border-white/10 text-white h-24"
                  />
                </div>

                <Button
                  onClick={handleCreateAnnouncement}
                  disabled={createAnnouncementMutation.isPending}
                  className="bg-[#C9A227] hover:bg-[#E8C547] text-black w-full"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Publicar Anuncio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List of announcements */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">
                Anuncios Publicados ({announcements.length})
              </h3>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#C9A227]/20 text-[#C9A227]">
                            {announcement.type === "winner"
                              ? "🏆 Ganador"
                              : announcement.type === "milestone"
                              ? "⭐ Milestone"
                              : "ℹ️ Info"}
                          </span>
                          {announcement.is_active ? (
                            <span className="text-xs text-green-400">
                              Visible
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Oculto
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium">
                          {announcement.title}
                        </h4>
                        {announcement.winner_name && (
                          <p className="text-sm text-gray-400">
                            {announcement.winner_name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleAnnouncementVisibility(announcement)
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          {announcement.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteAnnouncementMutation.mutate(announcement.id)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay anuncios publicados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-white font-semibold">
                  Mensajes Recientes ({messages.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-lg bg-white/5 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {msg.user_name}
                        </span>
                        {msg.is_admin && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#C9A227]/20 text-[#C9A227]">
                            Admin
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                          {msg.created_date &&
                            new Date(msg.created_date).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.message}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMessageMutation.mutate(msg.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay mensajes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}