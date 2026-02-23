import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const TIER_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  colaborador: "Colaborador"
};

const TIER_COLORS = {
  platinum: "bg-gray-300 text-black",
  gold: "bg-[#C9A227] text-black",
  silver: "bg-gray-400 text-black",
  bronze: "bg-amber-700 text-white",
  colaborador: "bg-gray-600 text-white"
};

export default function AdminPartners() {
  const queryClient = useQueryClient();
  const [editingPartner, setEditingPartner] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [tierFilter, setTierFilter] = useState("all");

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: () => base44.entities.Partner.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Partner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setShowDialog(false);
      setEditingPartner(null);
      toast.success("Partner añadido correctamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setShowDialog(false);
      setEditingPartner(null);
      toast.success("Partner actualizado correctamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Partner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner eliminado");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      logo_url: formData.get("logo_url"),
      tier: formData.get("tier") || "colaborador",
      website_url: formData.get("website_url"),
      description: formData.get("description"),
      is_active: formData.get("is_active") === "on",
      order: parseInt(formData.get("order") || "0"),
    };

    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openDialog = (partner = null) => {
    setEditingPartner(partner);
    setShowDialog(true);
  };

  const filteredPartners = tierFilter === "all" 
    ? partners 
    : partners.filter(p => p.tier === tierFilter);

  if (isLoading) {
    return <div className="text-gray-400">Cargando partners...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Partners</h3>
          <p className="text-sm text-gray-500">Gestiona los patrocinadores y colaboradores</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#C9A227] hover:bg-[#E8C547] text-black">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Partner
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        {["all", "platinum", "gold", "silver", "bronze", "colaborador"].map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              tierFilter === tier
                ? "bg-[#C9A227] text-black font-semibold"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {tier === "all" ? "Todos" : TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <Badge className={`${TIER_COLORS[partner.tier]} text-xs font-semibold`}>
                {TIER_LABELS[partner.tier]}
              </Badge>
              <Badge variant={partner.is_active ? "default" : "secondary"} className="text-xs">
                {partner.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            {partner.logo_url && (
              <div className="mb-3 p-4 rounded-xl bg-white/5 flex items-center justify-center">
                <img src={partner.logo_url} alt={partner.name} className="max-h-16 max-w-full object-contain" />
              </div>
            )}

            <h4 className="text-white font-semibold mb-2">{partner.name}</h4>
            {partner.description && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{partner.description}</p>
            )}
            
            {partner.website_url && (
              <a 
                href={partner.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#C9A227] hover:underline flex items-center gap-1 mb-3"
              >
                Sitio web <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDialog(partner)}
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteMutation.mutate(partner.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No hay partners en esta categoría</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPartner ? "Editar Partner" : "Añadir Partner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Nombre *</Label>
              <Input
                name="name"
                defaultValue={editingPartner?.name}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">URL del logo</Label>
              <Input
                name="logo_url"
                defaultValue={editingPartner?.logo_url}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-gray-300">Nivel de patrocinio</Label>
              <select
                name="tier"
                defaultValue={editingPartner?.tier || "colaborador"}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
              >
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Sitio web</Label>
              <Input
                name="website_url"
                defaultValue={editingPartner?.website_url}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-gray-300">Descripción</Label>
              <Textarea
                name="description"
                defaultValue={editingPartner?.description}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Orden de visualización</Label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={editingPartner?.order || 0}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingPartner?.is_active ?? true}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="text-gray-300">Partner activo</Label>
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
                {editingPartner ? "Actualizar" : "Añadir"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}