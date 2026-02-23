import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function VoteConfirmationDialog({ item, finalist, isOpen, onConfirm, onCancel, isProcessing }) {
  const displayItem = item || finalist;
  if (!displayItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-[#0a0e1a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Award className="w-5 h-5 text-[#c9a84c]" />
            Confirmar Voto
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            ¿Estás seguro de que quieres votar por este finalista? Solo puedes votar una vez por categoría.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 p-4 my-4"
        >
          <div className="flex items-start gap-4">
            <img
              src={finalist.photo_url || `https://ui-avatars.com/api/?name=${finalist.name}&background=c9a84c&color=0a0e1a&size=64`}
              alt={finalist.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-1">{finalist.name}</h3>
              <p className="text-[#c9a84c] text-sm font-medium mb-2">{finalist.specialty}</p>
              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs">
                {finalist.hospital && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {finalist.hospital}
                  </span>
                )}
                {finalist.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {finalist.country}
                  </span>
                )}
              </div>
              {finalist.category_name && (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-white/5 inline-block">
                  <span className="text-xs text-gray-400">Categoría: </span>
                  <span className="text-xs text-white font-medium">{finalist.category_name}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full mr-2"
                />
                Votando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Voto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}