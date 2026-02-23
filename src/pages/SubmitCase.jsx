import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileVideo, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SubmitCase() {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const caseId = "CASE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-2026";
      await base44.entities.Case.create({
        ...form,
        case_id: caseId,
        status: "pending",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("¡Caso enviado correctamente!");
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, video_url: file_url }));
    setUploading(false);
    toast.success("Video subido correctamente");
  };

  const handleCategoryChange = (catId) => {
    const cat = categories.find(c => c.id === catId);
    setForm(prev => ({ ...prev, category_id: catId, category_name: cat?.name || "" }));
  };

  if (!user) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto text-center py-20">
        <Upload className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Inicia sesión para enviar tu caso</h2>
        <p className="text-gray-500 mb-6">Necesitas estar autenticado para participar.</p>
        <Button className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
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
          <h2 className="text-white text-2xl font-bold mb-2">¡Caso Enviado!</h2>
          <p className="text-gray-400 mb-6">Tu caso clínico ha sido recibido y será revisado por nuestro equipo.</p>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => { setSubmitted(false); setForm({ title: "", description: "", category_id: "", category_name: "", hospital: "", country: "", specialty: "", surgery_type: "", video_url: "" }); }}
          >
            Enviar otro caso
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Enviar Caso Clínico</h1>
        <p className="text-gray-400">Comparte tu caso quirúrgico para los premios</p>
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
                  <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-gray-400 text-sm">Haz clic para subir video</span>
                  </>
                )}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            )}
          </div>
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!form.title || submitMutation.isPending}
          className="w-full bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold h-12"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Enviar Caso Clínico
        </Button>
      </div>
    </div>
  );
}