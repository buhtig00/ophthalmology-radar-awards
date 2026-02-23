import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function AdminFinalists() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", specialty: "", category_id: "", category_name: "", photo_url: "", bio: "", hospital: "", country: "" });

  const { data: finalists = [], isLoading } = useQuery({
    queryKey: ["finalists"],
    queryFn: () => base44.entities.Finalist.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Finalist.create({ ...data, is_active: true, vote_count: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalists"] });
      resetForm();
      toast.success("Finalista creado");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Finalist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalists"] });
      resetForm();
      toast.success("Finalista actualizado");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Finalist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalists"] });
      toast.success("Finalista eliminado");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", specialty: "", category_id: "", category_name: "", photo_url: "", bio: "", hospital: "", country: "" });
  };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name, specialty: f.specialty || "", category_id: f.category_id || "", category_name: f.category_name || "", photo_url: f.photo_url || "", bio: f.bio || "", hospital: f.hospital || "", country: f.country || "" });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCatChange = (catId) => {
    const cat = categories.find(c => c.id === catId);
    setForm(prev => ({ ...prev, category_id: catId, category_name: cat?.name || "" }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-400 text-sm">{finalists.length} finalistas</span>
        <Button size="sm" className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="w-5 h-5 text-[#c9a84c] animate-spin mx-auto my-10" />
      ) : (
        <div className="space-y-2">
          {finalists.map(f => (
            <div key={f.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center gap-3">
              <img
                src={f.photo_url || `https://ui-avatars.com/api/?name=${f.name}&background=c9a84c&color=0a0e1a&size=36`}
                className="w-9 h-9 rounded-lg object-cover"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <Link to={createPageUrl("FinalistDetail") + `?id=${f.id}`}>
                  <p className="text-white text-sm font-medium truncate hover:text-[#c9a84c] transition-colors">{f.name}</p>
                </Link>
                <p className="text-gray-500 text-xs">{f.category_name} · {f.vote_count || 0} votos</p>
              </div>
              <Link to={createPageUrl("FinalistDetail") + `?id=${f.id}`}>
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-white h-8 w-8">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button size="icon" variant="ghost" className="text-gray-500 hover:text-white h-8 w-8" onClick={() => handleEdit(f)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-400 h-8 w-8" onClick={() => deleteMutation.mutate(f.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => resetForm()}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nuevo"} Finalista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">Nombre *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Categoría</Label>
              <Select value={form.category_id} onValueChange={handleCatChange}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-sm">Hospital</Label>
                <Input value={form.hospital} onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">País</Label>
                <Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Foto URL</Label>
              <Input value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-gray-300" onClick={resetForm}>Cancelar</Button>
            <Button className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]" onClick={handleSubmit} disabled={!form.name}>
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}