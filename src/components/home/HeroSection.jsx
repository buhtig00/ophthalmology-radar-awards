import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Calendar, Video, Users, Trophy, Upload, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = React.memo(() => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden py-20">
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1485796826113-174aa68fd81b?w=1920&h=1080&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/5 backdrop-blur-xl mb-8">
            <Calendar className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[#C9A227] font-medium">23 Octubre 2026 • Madrid</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8"
        >
          La noche donde la
          <br />
          <span className="bg-gradient-to-r from-[#C9A227] via-[#E8C547] to-[#C9A227] bg-clip-text text-transparent">
            oftalmología se celebra
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Los primeros Óscars de la cirugía oftalmológica. Reconociendo la excelencia, 
          la innovación y el impacto real en la visión de los pacientes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={createPageUrl("SubmitCase")}>
            <Button size="lg" className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold px-10 h-14 text-lg gap-3 group shadow-2xl shadow-[#C9A227]/20">
              <Upload className="w-5 h-5" />
              Enviar Caso
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to={createPageUrl("Voting")}>
            <Button size="lg" variant="outline" className="border-[#C9A227]/30 text-white hover:bg-[#C9A227]/10 hover:text-white backdrop-blur-xl px-10 h-14 text-lg bg-black/20">
              Ver Casos y Votar
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;