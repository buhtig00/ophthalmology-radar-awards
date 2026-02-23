import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORY_ICONS = {
  "Retina": "👁️",
  "Glaucoma": "💧",
  "Segmento Anterior": "🔬",
  "Córnea": "🌀",
  "Oculoplástica": "✨",
  "Oftalmopediatría": "👶",
};

export default function CategoriesPreview({ categories }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Categorías</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Explora las categorías de los premios y descubre a los mejores profesionales en cada especialidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={createPageUrl("Voting") + `?category=${cat.id}`}
                className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c9a84c]/20 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{CATEGORY_ICONS[cat.name] || "🏆"}</div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{cat.description}</p>
                <div className="flex items-center gap-1 text-[#c9a84c] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver finalistas <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}