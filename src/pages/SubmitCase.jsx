import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileVideo, Loader2, CheckCircle2, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SubmitCase() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    category_name: "",
    hospital: "",
    country: "",
    specialty: "",
    surgery_type: "",
    video_url: "",
    attachment_urls: [],
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get("edit");
    if (caseId) {
      setEditingCaseId(caseId);
    }
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: existingCase } = useQuery({
    queryKey: ["case", editingCaseId],
    queryFn: async () => {
      const cases = await base44.entities.Case.list();
      return cases.find(c => c.id === editingCaseId);
    },
    enabled: !!editingCaseId,
  });

  useEffect(() => {
    if (existingCase && (existingCase.status === "pending" || !existingCase.status)) {
      setForm({
        title: existingCase.title || "",
        description: existingCase.description || "",
        category_id: existingCase.category_id || "",
        category_name: existingCase.category_name || "",
        hospital: existingCase.hospital || "",
        country: existingCase.country || "",
        specialty: existingCase.specialty || "",
        surgery_type: existingCase.surgery_type || "",
        video_url: existingCase.video_url || "",
        attachment_urls: existingCase.attachment_urls || [],
      });
    }
  }, [existingCase]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (editingCaseId) {
        await base44.entities.Case.update(editingCaseId, {
          ...form,
          status: "pending",
        });
      } else {
        const caseId = "CASE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-2026";
        await base44.entities.Case.create({
          ...form,
          case_id: caseId,
          status: "pending",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCases"] });
      setSubmitted(true);
      toast.success(editingCaseId ? "¡Caso actualizado correctamente!" : "¡Caso enviado correctamente!");
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, video_url: file_url }));
      toast.success("Video subido correctamente");
    } catch {
      toast.error("Error al subir el video");
    }
    setUploading(false);
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setForm(prev => ({ 
        ...prev, 
        attachment_urls: [...(prev.attachment_urls || []), ...uploadedUrls] 
      }));
      toast.success(`${files.length} archivo(s) subido(s) correctamente`);
    } catch {
      toast.error("Error al subir archivos");
    }
    setUploading(false);
  };

  const removeAttachment = (index) => {
    setForm(prev => ({
      ...prev,
      attachment_urls: prev.attachment_urls.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (catId) => {
    const cat = categories.find(c => c.id === catId);
    setForm(prev => ({ ...prev, category_id: catId, category_name: cat?.name || "" }));
  };

  if (!user) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <Upload className="w-12 h-12 text-[#C9A227]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Inicia sesión para enviar tu caso</h2>
        <p className="text-gray-500 mb-6">Necesitas estar autenticado para participar.</p>
        <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-white text-2xl font-bold mb-2">
            {editingCaseId ? "¡Caso Actualizado!" : "¡Caso Enviado!"}
          </h2>
          <p className="text-gray-400 mb-6">
            {editingCaseId 
              ? "Los cambios en tu caso han sido guardados correctamente."
              : "Tu caso clínico ha sido recibido y será revisado por nuestro equipo."}
          </p>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => { 
              setSubmitted(false); 
              setEditingCaseId(null);
              setForm({ title: "", description: "", category_id: "", category_name: "", hospital: "", country: "", specialty: "", surgery_type: "", video_url: "", attachment_urls: [] }); 
            }}
          >
            Enviar otro caso
          </Button>
        </motion.div>
      </div>
    );
  }

  if (editingCaseId && existingCase && existingCase.status !== "pending" && existingCase.status) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">No se puede editar</h2>
        <p className="text-gray-400">Solo puedes editar casos en estado "Pendiente".</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {editingCaseId ? "Editar Caso Clínico" : "Enviar Caso Clínico"}
        </h1>
        <p className="text-gray-400">
          {editingCaseId 
            ? "Modifica los detalles de tu caso mientras esté en revisión"
            : "Comparte tu caso quirúrgico para los premios"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
          <div>
            <Label className="text-gray-300 mb-2 block">Título del caso *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Vitrectomía mínimamente invasiva en desprendimiento de retina"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el caso clínico, técnica empleada, resultados..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-gray-300 mb-2 block">Categoría</Label>
              <Select value={form.category_id} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Tipo de cirugía</Label>
              <Input
                value={form.surgery_type}
                onChange={(e) => setForm(prev => ({ ...prev, surgery_type: e.target.value }))}
                placeholder="Ej: Vitrectomía"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-gray-300 mb-2 block">Hospital / Institución</Label>
              <Input
                value={form.hospital}
                onChange={(e) => setForm(prev => ({ ...prev, hospital: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">País</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <Label className="text-gray-300 mb-2 block">Video del caso</Label>
            {form.video_url ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <FileVideo className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm flex-1">Video subido correctamente</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setForm(prev => ({ ...prev, video_url: "" }))}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-gray-400 text-sm">Haz clic para subir video</span>
                  </>
                )}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Attachments Upload */}
          <div>
            <Label className="text-gray-300 mb-2 block">Archivos adjuntos (PDFs, imágenes)</Label>
            
            {form.attachment_urls && form.attachment_urls.length > 0 && (
              <div className="mb-3 space-y-2">
                {form.attachment_urls.map((url, index) => {
                  const fileName = url.split('/').pop().split('?')[0];
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                  const isPdf = /\.pdf$/i.test(fileName);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      {isImage ? <ImageIcon className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                      <span className="text-blue-300 text-sm flex-1 truncate">{fileName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <label className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-[#C9A227] animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-400 text-sm">Añadir archivos (PDF, imágenes)</span>
                </>
              )}
              <input 
                type="file" 
                accept="application/pdf,image/*" 
                multiple 
                className="hidden" 
                onChange={handleAttachmentUpload} 
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!form.title || submitMutation.isPending}
          className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold h-12"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {editingCaseId ? "Actualizar Caso" : "Enviar Caso Clínico"}
        </Button>
      </div>
    </div>
  );
}