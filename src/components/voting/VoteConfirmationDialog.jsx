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
            <Award className="w-5 h-5 text-[#C9A227]" />
            Confirmar Voto
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            ¿Estás seguro de que quieres votar por {displayItem.name ? "este finalista" : "este caso"}? Solo puedes votar una vez por categoría.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#C9A227]/20 bg-[#C9A227]/5 p-4 my-4"
        >
          <div className="flex items-start gap-4">
            {displayItem.photo_url ? (
              <img
                src={displayItem.photo_url}
                alt={displayItem.name || displayItem.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : displayItem.name ? (
              <img
                src={`https://ui-avatars.com/api/?name=${displayItem.name}&background=C9A227&color=000&size=64`}
                alt={displayItem.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#C9A227]/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-[#C9A227]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-1">{displayItem.name || displayItem.title}</h3>
              {displayItem.specialty && <p className="text-[#C9A227] text-sm font-medium mb-2">{displayItem.specialty}</p>}
              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs">
                {displayItem.hospital && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {displayItem.hospital}
                  </span>
                )}
                {displayItem.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {displayItem.country}
                  </span>
                )}
              </div>
              {displayItem.category_name && (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-white/5 inline-block">
                  <span className="text-xs text-gray-400">Categoría: </span>
                  <span className="text-xs text-white font-medium">{displayItem.category_name}</span>
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
            className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
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