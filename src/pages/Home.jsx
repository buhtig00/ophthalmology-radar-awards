import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, ArrowRight, Calendar, Video, Users, Trophy, 
  Target, Globe, CheckCircle, Shield, Eye, Upload,
  Play, MessageSquare, ChevronRight, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const SLIDES = [
  { id: 1, name: "Hero" },
  { id: 2, name: "Problema" },
  { id: 3, name: "Visión" },
  { id: 4, name: "Territorio" },
  { id: 5, name: "Proceso" },
  { id: 6, name: "Evaluación" },
  { id: 7, name: "Categorías" },
  { id: 8, name: "Finalistas" },
  { id: 9, name: "Jurado" },
  { id: 10, name: "Streaming" },
  { id: 11, name: "Partners" },
  { id: 12, name: "FAQ" },
  { id: 13, name: "CTA" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;
      
      if (e.deltaY > 0 && activeSlide < 13) {
        setIsScrolling(true);
        setActiveSlide(prev => prev + 1);
        setTimeout(() => setIsScrolling(false), 1000);
      } else if (e.deltaY < 0 && activeSlide > 1) {
        setIsScrolling(true);
        setActiveSlide(prev => prev - 1);
        setTimeout(() => setIsScrolling(false), 1000);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeSlide, isScrolling]);

  const scrollToSlide = (slideId) => {
    setActiveSlide(slideId);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SLIDES.map((slide) => (
          <button
            key={slide.id}
            onClick={() => scrollToSlide(slide.id)}
            className={`group relative transition-all duration-300 ${
              activeSlide === slide.id ? 'w-2 h-8' : 'w-2 h-2'
            }`}
          >
            <div className={`w-full h-full rounded-full transition-all ${
              activeSlide === slide.id 
                ? 'bg-[#C9A227]' 
                : 'bg-white/20 group-hover:bg-white/40'
            }`} />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {slide.name}
            </span>
          </button>
        ))}
      </div>

      {/* Slides Container */}
      <div 
        className="h-screen transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(-${(activeSlide - 1) * 100}vh)` }}
      >
        {/* Slide 1: Hero */}
        <HeroSlide />

        {/* Slide 2: Problema */}
        <ProblemaSlide />

        {/* Slide 3: Visión */}
        <VisionSlide />

        {/* Slide 4: Territorio */}
        <TerritorioSlide />

        {/* Slide 5: Proceso */}
        <ProcesoSlide />

        {/* Slide 6: Evaluación */}
        <EvaluacionSlide />

        {/* Slide 7: Categorías */}
        <CategoriasSlide />

        {/* Slide 8: Finalistas */}
        <FinalistasSlide />

        {/* Slide 9: Jurado */}
        <JuradoSlide />

        {/* Slide 10: Streaming */}
        <StreamingSlide />

        {/* Slide 11: Partners */}
        <PartnersSlide />

        {/* Slide 12: FAQ */}
        <FAQSlide />

        {/* Slide 13: CTA Final */}
        <CTASlide />
      </div>
    </div>
  );
}

// Slide 1: Hero
function HeroSlide() {
  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with cinematic image */}
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
            <span className="text-[#C9A227] font-medium">15 Octubre 2026 • Madrid</span>
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link to={createPageUrl("SubmitCase")}>
            <Button size="lg" className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold px-10 h-14 text-lg gap-3 group shadow-2xl shadow-[#C9A227]/20">
              <Upload className="w-5 h-5" />
              Enviar Caso
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to={createPageUrl("Categories")}>
            <Button size="lg" variant="outline" className="border-[#C9A227]/30 text-white hover:bg-[#C9A227]/10 backdrop-blur-xl px-10 h-14 text-lg">
              Explorar Categorías
            </Button>
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Video, label: "Proyección de cirugías finalistas" },
            { icon: Users, label: "Debate clínico en vivo" },
            { icon: Trophy, label: "Entrega de premios" },
            { icon: MessageSquare, label: "Networking exclusivo" },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <item.icon className="w-6 h-6 text-[#C9A227] mx-auto mb-3" />
              <p className="text-sm text-gray-400">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-500">Desliza para explorar</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-[#C9A227]/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-[#C9A227] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

// Slide 2: Problema
function ProblemaSlide() {
  const problems = [
    {
      number: "01",
      title: "Falta de reconocimiento",
      desc: "Los oftalmólogos destacados rara vez reciben el reconocimiento público que merecen por su trabajo excepcional.",
      icon: Eye
    },
    {
      number: "02",
      title: "Ausencia de estándares",
      desc: "No existe un marco de referencia común para evaluar la excelencia en cirugía oftalmológica de forma objetiva.",
      icon: Target
    },
    {
      number: "03",
      title: "Poca visibilidad",
      desc: "Los casos clínicos excepcionales se quedan en hospitales sin difusión ni impacto en la comunidad médica.",
      icon: Zap
    }
  ];

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-6">El Problema</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            La excelencia quirúrgica merece ser reconocida, evaluada y compartida
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl border border-[#C9A227]/20 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl relative group hover:border-[#C9A227]/40 transition-all"
            >
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-[#C9A227]/10 backdrop-blur-xl border border-[#C9A227]/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#C9A227]">{problem.number}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 flex items-center justify-center mb-6 mt-4">
                <problem.icon className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">{problem.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Slide 3: Visión
function VisionSlide() {
  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#C9A227]/10 backdrop-blur-xl border border-[#C9A227]/30 flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-[#C9A227]" />
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">Nuestra Visión</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Crear el evento de referencia mundial para la excelencia en cirugía oftalmológica, 
            donde la innovación y el rigor clínico se celebran con transparencia y prestigio.
          </p>
          <div className="space-y-4">
            {[
              { label: "Excelencia real", value: "No solo popularidad" },
              { label: "Rigor científico", value: "Evaluación independiente" },
              { label: "Transparencia", value: "Proceso público y verificable" },
              { label: "Impacto global", value: "España y Portugal como epicentro" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-square rounded-3xl overflow-hidden border border-[#C9A227]/20">
            <img 
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=800&fit=crop&q=80" 
              alt="Quirófano" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          {/* Stats overlay */}
          <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
            {[
              { value: "1,000+", label: "Cirujanos" },
              { value: "6", label: "Categorías" },
              { value: "50+", label: "Finalistas" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-[#C9A227]/20">
                <p className="text-2xl font-bold text-[#C9A227]">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Slide 4: Territorio
function TerritorioSlide() {
  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Globe className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-6">España y Portugal</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
            El epicentro de la excelencia oftalmológica ibérica
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "1,200+ Oftalmólogos",
              desc: "Comunidad activa de cirujanos en España y Portugal",
              highlight: "Altamente cualificados"
            },
            { 
              title: "Innovación constante",
              desc: "Centros de referencia internacional en ambos países",
              highlight: "Investigación puntera"
            },
            { 
              title: "Tradición de excelencia",
              desc: "Escuelas reconocidas mundialmente por su formación",
              highlight: "Impacto global"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl border border-[#C9A227]/20 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl"
            >
              <div className="inline-block px-4 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-sm font-semibold mb-6">
                {item.highlight}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Slide 5: Proceso
function ProcesoSlide() {
  const steps = [
    { number: 1, title: "Convocatoria", desc: "Abierta para todos los oftalmólogos", date: "Enero 2026" },
    { number: 2, title: "Subida de casos", desc: "Video + datos clínicos completos", date: "Feb-Marzo" },
    { number: 3, title: "Evaluación", desc: "Jurado independiente revisa", date: "Abril-Mayo" },
    { number: 4, title: "Votación pública", desc: "Comunidad elige favoritos", date: "Junio-Sept" },
    { number: 5, title: "Gala final", desc: "Ceremonia de entrega", date: "15 Oct 2026" }
  ];

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-6">Proceso Riguroso</h2>
          <p className="text-xl text-gray-400">5 fases para garantizar transparencia y excelencia</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent hidden md:block" />
          
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {/* Number circle */}
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#C9A227] to-[#9A7A1F] flex items-center justify-center mb-6 shadow-2xl shadow-[#C9A227]/30 border-4 border-black">
                  <span className="text-3xl font-bold text-black">{step.number}</span>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{step.desc}</p>
                  <p className="text-xs text-[#C9A227]">{step.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Slide 6: Evaluación
function EvaluacionSlide() {
  const principles = [
    { icon: Shield, title: "Independencia", desc: "Jurado sin conflictos de interés" },
    { icon: Target, title: "Objetividad", desc: "Criterios científicos claros" },
    { icon: CheckCircle, title: "Ética", desc: "Consentimientos y privacidad" },
    { icon: Star, title: "Seguridad", desc: "Prioridad al paciente" }
  ];

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Shield className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-6">Evaluación Clínica Independiente</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Un jurado de expertos internacionales evalúa cada caso con criterios rigurosos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-3xl border border-[#C9A227]/20 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A227]/10 flex items-center justify-center mb-4">
                <principle.icon className="w-8 h-8 text-[#C9A227]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{principle.title}</h3>
              <p className="text-sm text-gray-400">{principle.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Placeholder slides for remaining sections
function CategoriasSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="text-center">
        <Award className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">Categorías</h2>
        <p className="text-gray-400">Próximamente: 6 categorías + Gran Premio OR</p>
      </div>
    </section>
  );
}

function FinalistasSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Trophy className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">Finalistas</h2>
        <p className="text-gray-400">Los mejores cirujanos oftalmológicos de 2026</p>
      </div>
    </section>
  );
}

function JuradoSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="text-center">
        <Users className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">Jurado</h2>
        <p className="text-gray-400">Panel de expertos internacionales</p>
      </div>
    </section>
  );
}

function StreamingSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-black">
      <div className="max-w-2xl mx-auto px-8 text-center">
        <Play className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-6">Acceso Online</h2>
        <p className="text-xl text-gray-400 mb-12">
          Vive la gala desde cualquier lugar del mundo
        </p>
        <div className="p-10 rounded-3xl border-2 border-[#C9A227]/30 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
          <div className="text-6xl font-bold text-white mb-2">9€</div>
          <p className="text-[#C9A227] font-semibold mb-6">Pase Streaming Directo</p>
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-[#C9A227]" />
              Transmisión en vivo HD
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-[#C9A227]" />
              Chat en directo con la comunidad
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-[#C9A227]" />
              Acceso a repetición 48h
            </li>
          </ul>
          <Button size="lg" className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-bold h-14 text-lg">
            Comprar Pase
          </Button>
        </div>
      </div>
    </section>
  );
}

function PartnersSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="text-center">
        <Star className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">Partners</h2>
        <p className="text-gray-400">Colaboradores institucionales</p>
      </div>
    </section>
  );
}

function FAQSlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">FAQ</h2>
        <p className="text-gray-400">Preguntas frecuentes</p>
      </div>
    </section>
  );
}

function CTASlide() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      <div className="text-center max-w-2xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Trophy className="w-20 h-20 text-[#C9A227] mx-auto mb-8" />
          <h2 className="text-6xl font-bold text-white mb-6">¿Listo para participar?</h2>
          <p className="text-xl text-gray-400 mb-12">
            Únete a la celebración de la excelencia oftalmológica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("SubmitCase")}>
              <Button size="lg" className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-bold px-12 h-16 text-lg">
                Enviar mi caso
              </Button>
            </Link>
            <Link to={createPageUrl("Voting")}>
              <Button size="lg" variant="outline" className="border-[#C9A227]/30 text-white hover:bg-[#C9A227]/10 px-12 h-16 text-lg">
                Explorar finalistas
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}