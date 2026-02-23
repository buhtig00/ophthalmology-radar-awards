import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/home/HeroSection";
import CategoriesPreview from "@/components/home/CategoriesPreview";
import CountdownSection from "@/components/home/CountdownSection";

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ is_active: true }),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: () => base44.entities.EventConfig.list(),
  });

  const config = configs[0];

  return (
    <div>
      <HeroSection />
      {config?.event_date && <CountdownSection eventDate={config.event_date} />}
      {categories.length > 0 && <CategoriesPreview categories={categories} />}
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <p className="text-gray-600 text-sm">
          © 2026 Ophthalmology Radar Awards. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}