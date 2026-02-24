import React from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const InstitutionsSection = React.memo(() => {
  const [partners, setPartners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    base44.entities.Partner.filter({ is_active: true })
      .then(data => {
        if (mounted) {
          setPartners(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setPartners([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-black to-[#0a0a0a] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[#C9A227] text-sm font-semibold tracking-wider uppercase mb-3">
            Respaldado por líderes en oftalmología
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Instituciones Representadas
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Los mejores hospitales y centros de referencia de España y Portugal participan en los premios
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
            {partners.length > 0 ? (
              partners.map((partner, i) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#C9A227]/20 transition-all group"
                >
                  {partner.logo_url ? (
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name}
                      className="w-full h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                      title={partner.name}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-[#C9A227] font-bold text-sm">{partner.name}</div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                <p className="mb-2">Cargando instituciones...</p>
              </div>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "50+", label: "Centros hospitalarios" },
            { value: "1,200+", label: "Oftalmólogos" },
            { value: "2", label: "Países" },
            { value: "22", label: "Categorías" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
              <div className="text-3xl sm:text-4xl font-bold text-[#C9A227] mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

InstitutionsSection.displayName = "InstitutionsSection";
export default InstitutionsSection;