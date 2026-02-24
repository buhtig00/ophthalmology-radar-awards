import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileVideo, Loader2, CheckCircle2, X, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function SubmitCase() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        return value.trim().length < 10 ? "El título debe tener al menos 10 caracteres" : "";
      case "description":
        return value.trim().length < 20 ? "La descripción debe tener al menos 20 caracteres" : "";
      case "category_id":
        return !value ? "Selecciona una categoría" : "";
      case "hospital":
        return value.trim().length < 3 ? "El nombre del hospital es muy corto" : "";
      case "country":
        return value.trim().length < 2 ? "El país es requerido" : "";
      default:
        return "";
    }
  };

  const handleFieldChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return form.title.trim().length >= 10 &&
           form.description.trim().length >= 20 &&
           form.category_id &&
           form.hospital.trim().length >= 3 &&
           form.country.trim().length >= 2;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (editingCaseId) {
        return await base44.entities.Case.update(editingCaseId, {
          ...form,
          status: "pending",
        });
      } else {
        const caseId = "CASE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-2026";
        return await base44.entities.Case.create({
          ...form,
          case_id: caseId,
          status: "pending",
        });
      }
    },
    onSuccess: (createdCase) => {
      queryClient.invalidateQueries({ queryKey: ["myCases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
      setSubmitted(true);
      toast.success(editingCaseId ? "¡Caso actualizado correctamente!" : "¡Caso enviado correctamente!");
      
      // Redirect to case detail after brief delay
      if (createdCase?.id && !editingCaseId) {
        setTimeout(() => {
          window.location.href = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/CaseDetail')}?id=${createdCase.id}`;
        }, 2000);
      }
    },
    onError: (error) => {
      console.error("Error submitting case:", error);
      toast.error("Error al enviar el caso. Por favor, intenta de nuevo.");
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 500 * 1024 * 1024) {
      toast.error("El video no puede superar 500MB");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 95));
      }, 300);
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setForm(prev => ({ ...prev, video_url: file_url }));
        setUploading(false);
        setUploadProgress(0);
        toast.success("Video subido correctamente");
      }, 500);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      toast.error("Error al subir el video");
      console.error(error);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
      toast.error("El tamaño total no puede superar 100MB");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const progressBase = (i / files.length) * 100;
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(progressBase + ((prev - progressBase) * 0.5) + Math.random() * 5, progressBase + 95/files.length));
        }, 200);
        
        const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
        uploadedUrls.push(file_url);
        
        clearInterval(progressInterval);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      setForm(prev => ({ 
        ...prev, 
        attachment_urls: [...(prev.attachment_urls || []), ...uploadedUrls] 
      }));
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        toast.success(`${files.length} archivo(s) subido(s) correctamente`);
      }, 300);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      toast.error("Error al subir archivos");
      console.error(error);
    }
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
    setTouched(prev => ({ ...prev, category_id: true }));
    const error = validateField("category_id", catId);
    setErrors(prev => ({ ...prev, category_id: error }));
  };

  const handleSubmitClick = () => {
    const newErrors = {};
    let hasErrors = false;
    
    ["title", "description", "category_id", "hospital", "country"].forEach(field => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    setTouched({ title: true, description: true, category_id: true, hospital: true, country: true });
    
    if (hasErrors) {
      toast.error("Por favor, completa todos los campos requeridos correctamente");
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    submitMutation.mutate();
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
              onChange={(e) => handleFieldChange("title", e.target.value)}
              onBlur={() => handleBlur("title")}
              placeholder="Ej: Vitrectomía mínimamente invasiva en desprendimiento de retina"
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 ${
                touched.title && errors.title ? "border-red-500/50" : ""
              }`}
            />
            {touched.title && errors.title && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </div>
            )}
            {touched.title && !errors.title && form.title && (
              <div className="flex items-center gap-1 mt-1 text-green-400 text-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Título válido</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Descripción *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="Describe el caso clínico, técnica empleada, resultados..."
              rows={4}
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 ${
                touched.description && errors.description ? "border-red-500/50" : ""
              }`}
            />
            {touched.description && errors.description && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </div>
            )}
            {touched.description && !errors.description && form.description && (
              <div className="flex items-center gap-1 mt-1 text-green-400 text-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Descripción válida</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-gray-300 mb-2 block">Categoría *</Label>
              <Select value={form.category_id} onValueChange={handleCategoryChange}>
                <SelectTrigger className={`bg-white/5 border-white/10 text-white ${
                  touched.category_id && errors.category_id ? "border-red-500/50" : ""
                }`}>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.category_id && errors.category_id && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.category_id}</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Tipo de cirugía</Label>
              <Input
                value={form.surgery_type}
                onChange={(e) => handleFieldChange("surgery_type", e.target.value)}
                placeholder="Ej: Vitrectomía"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-gray-300 mb-2 block">Hospital / Institución *</Label>
              <Input
                value={form.hospital}
                onChange={(e) => handleFieldChange("hospital", e.target.value)}
                onBlur={() => handleBlur("hospital")}
                className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 ${
                  touched.hospital && errors.hospital ? "border-red-500/50" : ""
                }`}
              />
              {touched.hospital && errors.hospital && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.hospital}</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">País *</Label>
              <Input
                value={form.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 ${
                  touched.country && errors.country ? "border-red-500/50" : ""
                }`}
              />
              {touched.country && errors.country && (
                <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.country}</span>
                </div>
              )}
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
              <div>
                <label className="flex items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <Loader2 className="w-6 h-6 text-[#C9A227] animate-spin" />
                      <span className="text-gray-400 text-sm">Subiendo video...</span>
                      <div className="w-full max-w-xs">
                        <Progress value={uploadProgress} className="h-2" />
                        <div className="text-center text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500" />
                      <span className="text-gray-400 text-sm">Haz clic para subir video (máx 500MB)</span>
                    </>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
                </label>
              </div>
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
                <div className="flex flex-col items-center gap-2 w-full">
                  <Loader2 className="w-5 h-5 text-[#C9A227] animate-spin" />
                  <span className="text-gray-400 text-sm">Subiendo archivos...</span>
                  <div className="w-full max-w-xs">
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="text-center text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-400 text-sm">Añadir archivos (máx 100MB total)</span>
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
          onClick={handleSubmitClick}
          disabled={!isFormValid() || submitMutation.isPending || uploading}
          className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {editingCaseId ? "Actualizar Caso" : "Enviar Caso Clínico"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-[#0a0e1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Confirmar Envío</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro de que deseas enviar este caso? Revisa todos los datos antes de continuar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="border-l-2 border-[#C9A227] pl-3">
              <div className="text-sm text-gray-500">Título</div>
              <div className="text-white font-medium">{form.title}</div>
            </div>
            <div className="border-l-2 border-[#C9A227] pl-3">
              <div className="text-sm text-gray-500">Categoría</div>
              <div className="text-white">{form.category_name}</div>
            </div>
            <div className="border-l-2 border-[#C9A227] pl-3">
              <div className="text-sm text-gray-500">Hospital</div>
              <div className="text-white">{form.hospital}</div>
            </div>
            {form.video_url && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Video incluido</span>
              </div>
            )}
            {form.attachment_urls?.length > 0 && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{form.attachment_urls.length} archivo(s) adjunto(s)</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Revisar
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={submitMutation.isPending}
              className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar y Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}