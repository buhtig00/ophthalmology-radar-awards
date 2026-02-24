import React, { lazy, Suspense } from "react";
import OnboardingTour from "@/components/OnboardingTour";
import ScrollNavigation from "@/components/home/ScrollNavigation";

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
      <ScrollNavigation />
      <Suspense fallback={<LoadingSpinner />}>
        <div id="hero">
          <HeroSection />
        </div>
        <div id="institutions">
          <InstitutionsSection />
        </div>
      </Suspense>
    </div>
  );
}