import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminJury() {
  const queryClient = useQueryClient();
  const [editingJury, setEditingJury] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jury = [], isLoading } = useQuery({
    queryKey: ["jury"],
    queryFn: () => base44.entities.Jury.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Jury.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jury"] });
      setShowDialog(false);
      setEditingJury(null);
      toast.success("Jurado añadido correctamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Jury.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jury"] });
      setShowDialog(false);
      setEditingJury(null);
      toast.success("Jurado actualizado correctamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Jury.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jury"] });
      toast.success("Jurado eliminado");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      title: formData.get("title"),
      specialty: formData.get("specialty"),
      hospital: formData.get("hospital"),
      country: formData.get("country"),
      email: formData.get("email"),
      photo_url: formData.get("photo_url"),
      bio: formData.get("bio"),
      is_active: formData.get("is_active") === "on",
      order: parseInt(formData.get("order") || "0"),
    };

    if (editingJury) {
      updateMutation.mutate({ id: editingJury.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openDialog = (juryMember = null) => {
    setEditingJury(juryMember);
    setShowDialog(true);
  };

  const filteredJury = jury.filter(j =>
    j.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-gray-400">Cargando jurado...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Jurado</h3>
          <p className="text-sm text-gray-500">Gestiona el panel de expertos evaluadores</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#C9A227] hover:bg-[#E8C547] text-black">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Jurado
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o hospital..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredJury.map((juryMember) => (
          <div key={juryMember.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex gap-4">
              <img
                src={juryMember.photo_url || `https://ui-avatars.com/api/?name=${juryMember.name}&background=C9A227&color=000`}
                alt={juryMember.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{juryMember.name}</h4>
                    <p className="text-sm text-[#C9A227]">{juryMember.title}</p>
                  </div>
                  <Badge variant={juryMember.is_active ? "default" : "secondary"} className="text-xs">
                    {juryMember.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-400 mb-3">
                  {juryMember.specialty && <p>• {juryMember.specialty}</p>}
                  {juryMember.hospital && <p>• {juryMember.hospital}</p>}
                  {juryMember.country && <p>• {juryMember.country}</p>}
                  <p className="text-gray-500">✉ {juryMember.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(juryMember)}
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(juryMember.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJury.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No hay miembros del jurado</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingJury ? "Editar Jurado" : "Añadir Jurado"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Nombre completo *</Label>
                <Input
                  name="name"
                  defaultValue={editingJury?.name}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={editingJury?.email}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Título profesional</Label>
              <Input
                name="title"
                defaultValue={editingJury?.title}
                placeholder="Ej: Profesor de Oftalmología"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Especialidad</Label>
                <Input
                  name="specialty"
                  defaultValue={editingJury?.specialty}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">País</Label>
                <Input
                  name="country"
                  defaultValue={editingJury?.country}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Hospital/Institución</Label>
              <Input
                name="hospital"
                defaultValue={editingJury?.hospital}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">URL de foto</Label>
              <Input
                name="photo_url"
                defaultValue={editingJury?.photo_url}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-gray-300">Biografía</Label>
              <Textarea
                name="bio"
                defaultValue={editingJury?.bio}
                className="bg-white/5 border-white/10 text-white"
                rows={4}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Orden de visualización</Label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={editingJury?.order || 0}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingJury?.is_active ?? true}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="text-gray-300">Jurado activo</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#C9A227] hover:bg-[#E8C547] text-black"
              >
                {editingJury ? "Actualizar" : "Añadir"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}