import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const TOUR_STEPS = [
  {
    title: "¡Bienvenido a los Óscars de Ophthalmology Radar!",
    description: "Te guiaremos por las funcionalidades principales de la plataforma para que aproveches al máximo tu experiencia.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop"
  },
  {
    title: "Envía tu Caso Clínico",
    description: "Comparte tus mejores casos quirúrgicos en oftalmología. Sube videos, imágenes y documentación completa. Nuestro equipo revisará cada envío.",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=300&fit=crop"
  },
  {
    title: "Vota por los Mejores Casos",
    description: "Una vez que los casos sean aprobados, podrás votar por tus favoritos en cada categoría. ¡Tu voto cuenta para elegir a los ganadores!",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop"
  },
  {
    title: "Evaluación del Jurado",
    description: "Un panel de expertos internacionales evaluará los casos según criterios de innovación, impacto clínico y calidad de presentación.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
  },
  {
    title: "Asiste a la Gala de Premios",
    description: "Adquiere tu pase de streaming o VIP para disfrutar del evento en vivo. Networking, reconocimientos y celebración de la excelencia en oftalmología.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop"
  }
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour");
    if (!hasSeenTour) {
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenOnboardingTour", "true");
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#0a0e1a] border-white/10 max-w-2xl p-0 overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <img
            src={step.image}
            alt={step.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            <span className="text-[#C9A227] font-semibold text-sm">
              Paso {currentStep + 1} de {TOUR_STEPS.length}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {step.title}
            </h2>
            <p className="text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-8 bg-[#C9A227]"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Comenzar" : "Siguiente"}
                {currentStep < TOUR_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Saltar introducción
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}