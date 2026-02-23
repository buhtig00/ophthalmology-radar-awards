import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Edit2, X, Mail, Building2, MapPin, Stethoscope, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfileInfo({ user }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: user.full_name || "",
    hospital: user.hospital || "",
    country: user.country || "",
    specialty: user.specialty || "",
    avatar_url: user.avatar_url || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar el perfil");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleCancel = () => {
    setForm({
      full_name: user.full_name || "",
      hospital: user.hospital || "",
      country: user.country || "",
      specialty: user.specialty || "",
      avatar_url: user.avatar_url || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, avatar_url: file_url }));
      toast.success("Foto subida correctamente");
    } catch (error) {
      toast.error("Error al subir la foto");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-white/5">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-500" />
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 p-2 bg-[#c9a84c] rounded-full cursor-pointer hover:bg-[#a07c2e] transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 text-[#0a0e1a] animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-[#0a0e1a]" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-white text-xl font-semibold">{user.full_name || user.email}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === "admin" 
                ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20" 
                : "bg-white/5 text-gray-400 border border-white/10"
            }`}>
              {user.role === "admin" ? "Administrador" : "Usuario"}
            </span>
          </div>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="border-white/10 text-gray-400 hover:bg-white/5"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Nombre completo
          </Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white disabled:opacity-60"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            value={user.email}
            disabled
            className="bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Hospital / Institución
          </Label>
          <Input
            value={form.hospital}
            onChange={(e) => setForm(prev => ({ ...prev, hospital: e.target.value }))}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white disabled:opacity-60"
            placeholder="Ej: Hospital Vall d'Hebron"
          />
        </div>

        <div>
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            País
          </Label>
          <Input
            value={form.country}
            onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white disabled:opacity-60"
            placeholder="Ej: España"
          />
        </div>

        <div className="sm:col-span-2">
          <Label className="text-gray-300 mb-2 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Especialidad
          </Label>
          <Input
            value={form.specialty}
            onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white disabled:opacity-60"
            placeholder="Ej: Cirugía de retina"
          />
        </div>
      </div>
    </div>
  );
}