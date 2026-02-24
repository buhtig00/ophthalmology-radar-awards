import React, { lazy, Suspense } from "react";
import OnboardingTour from "@/components/OnboardingTour";

// Lazy load sections for better performance
const HeroSection = lazy(() => import("@/components/home/HeroSection"));
const InstitutionsSection = lazy(() => import("@/components/home/InstitutionsSection"));

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
        <InstitutionsSection />
      </Suspense>
    </div>
  );
}