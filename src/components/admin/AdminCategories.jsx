import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowDialog(false);
      setEditingCategory(null);
      toast.success("Categoría creada correctamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowDialog(false);
      setEditingCategory(null);
      toast.success("Categoría actualizada correctamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría eliminada");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image_url: formData.get("image_url"),
      is_active: formData.get("is_active") === "on",
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openDialog = (category = null) => {
    setEditingCategory(category);
    setShowDialog(true);
  };

  if (isLoading) {
    return <div className="text-gray-400">Cargando categorías...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Categorías</h3>
          <p className="text-sm text-gray-500">Gestiona las categorías del evento</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#C9A227] hover:bg-[#E8C547] text-black">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{category.name}</h4>
                  <p className="text-xs text-gray-500">{category.slug}</p>
                </div>
              </div>
              <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs">
                {category.is_active ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            {category.description && (
              <p className="text-sm text-gray-400 mb-3">{category.description}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDialog(category)}
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteMutation.mutate(category.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0a0a0a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Nombre</Label>
              <Input
                name="name"
                defaultValue={editingCategory?.name}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Slug (URL-friendly)</Label>
              <Input
                name="slug"
                defaultValue={editingCategory?.slug}
                className="bg-white/5 border-white/10 text-white"
                placeholder="ej: retina-quirurgica"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Descripción</Label>
              <Textarea
                name="description"
                defaultValue={editingCategory?.description}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-gray-300">URL de imagen</Label>
              <Input
                name="image_url"
                defaultValue={editingCategory?.image_url}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={editingCategory?.is_active ?? true}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="text-gray-300">Categoría activa</Label>
            </div>
            <div className="flex gap-3">
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
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}