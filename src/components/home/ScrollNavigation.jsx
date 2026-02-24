import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const sections = [
  { id: "hero", label: "Inicio" },
  { id: "institutions", label: "Instituciones" }
];

export default function ScrollNavigation() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
      {sections.map(({ id, label }) => (
        <div key={id} className="relative group">
          <button
            onClick={() => scrollToSection(id)}
            className="relative w-3 h-3 rounded-full transition-all"
            aria-label={`Ir a ${label}`}
          >
            <div
              className={`w-full h-full rounded-full transition-all ${
                activeSection === id
                  ? "bg-[#C9A227] scale-150"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
            {activeSection === id && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 rounded-full border-2 border-[#C9A227]"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#C9A227] text-black text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}