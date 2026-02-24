import React, { lazy, Suspense } from "react";
import OnboardingTour from "@/components/OnboardingTour";

// Lazy load sections for better performance
const HeroSection = lazy(() => import("@/components/home/HeroSection"));
const InstitutionsSection = lazy(() => import("@/components/home/InstitutionsSection"));
const ProblemaSlide = lazy(() => import("@/components/home/ProblemaSlide"));
const VisionSlide = lazy(() => import("@/components/home/VisionSlide"));
const TerritorioSlide = lazy(() => import("@/components/home/TerritorioSlide"));
const ProcesoSlide = lazy(() => import("@/components/home/ProcesoSlide"));
const EvaluacionSlide = lazy(() => import("@/components/home/EvaluacionSlide"));
const CategoriasSlide = lazy(() => import("@/components/home/CategoriasSlide"));
const FinalistasSlide = lazy(() => import("@/components/home/FinalistasSlide"));
const JuradoSlide = lazy(() => import("@/components/home/JuradoSlide"));
const StreamingSlide = lazy(() => import("@/components/home/StreamingSlide"));
const PartnersSlide = lazy(() => import("@/components/home/PartnersSlide"));
const FAQSlide = lazy(() => import("@/components/home/FAQSlide"));
const CTASlide = lazy(() => import("@/components/home/CTASlide"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  return (
    <div className="relative bg-black overflow-x-hidden">
      <OnboardingTour />
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={null}>
        <InstitutionsSection />
        <ProblemaSlide />
        <VisionSlide />
        <TerritorioSlide />
        <ProcesoSlide />
        <EvaluacionSlide />
        <CategoriasSlide />
        <FinalistasSlide />
        <JuradoSlide />
        <StreamingSlide />
        <PartnersSlide />
        <FAQSlide />
        <CTASlide />
      </Suspense>
    </div>
  );
}