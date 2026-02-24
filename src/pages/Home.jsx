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
  const categoryGroups = [
    {
      title: "Categorías Core Quirúrgicas",
      icon: Trophy,
      color: "from-[#C9A227] to-[#E8C547]",
      categories: [
        { id: 1, name: "Mejor cirugía de catarata compleja", desc: "Zonulopatía, pseudoexfoliación, trauma" },
        { id: 2, name: "Mejor cirugía refractiva avanzada", desc: "SMILE, ICL, casos post-LASIK" },
        { id: 3, name: "Mejor cirugía de glaucoma", desc: "MIGS, cirugía combinada, rescate" },
        { id: 4, name: "Mejor cirugía de retina", desc: "Membranas, DR, vítreo complejo" },
        { id: 5, name: "Mejor trasplante corneal", desc: "DMEK, DSAEK, DALK, alto riesgo" },
        { id: 6, name: "Mejor cirugía oculoplástica", desc: "Reconstrucción, estética, trauma" }
      ]
    },
    {
      title: "Excelencia Técnica",
      icon: Zap,
      color: "from-blue-400 to-cyan-400",
      categories: [
        { id: 7, name: "Mejor manejo de complicaciones", desc: "Resolución magistral intraoperatoria" },
        { id: 8, name: "Mejor toma de decisiones", desc: "Estrategia y criterio clínico" },
        { id: 9, name: "Mejor innovación técnica", desc: "Nueva técnica o modificación" },
        { id: 10, name: "Mejor resultado visual", desc: "Impacto objetivo medible" }
      ]
    },
    {
      title: "Contenido y Didáctica",
      icon: Video,
      color: "from-purple-400 to-pink-400",
      categories: [
        { id: 11, name: "Mejor video educativo", desc: "Claridad y pedagogía" },
        { id: 12, name: "Mejor narración clínica", desc: "Valor formativo paso a paso" },
        { id: 13, name: "Mejor caso en directo", desc: "Capacidad docente en vivo" }
      ]
    },
    {
      title: "Premios Especiales",
      icon: Star,
      color: "from-[#C9A227] via-[#E8C547] to-[#C9A227]",
      categories: [
        { id: 0, name: "🏅 Gran Premio Óscar OR", desc: "El mejor caso global de todas las categorías", featured: true },
        { id: 14, name: "Premio del público", desc: "Votación abierta de la comunidad" },
        { id: 15, name: "Cirujano revelación", desc: "Jóvenes talentos emergentes" },
        { id: 16, name: "Premio trayectoria", desc: "Reconocimiento honorífico" }
      ]
    }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Award className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-4">Categorías de Premios</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            22 categorías que reconocen la excelencia quirúrgica desde todos los ángulos
          </p>
        </motion.div>

        <div className="space-y-12">
          {categoryGroups.map((group, groupIdx) => (
            <motion.div
              key={groupIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: groupIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                  <group.icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">{group.title}</h3>
              </div>
              
              <div className={`grid ${group.categories.length > 4 ? 'md:grid-cols-3' : group.categories.length > 3 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                {group.categories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIdx * 0.1 + idx * 0.05 }}
                    className={`p-5 rounded-2xl border ${cat.featured ? 'border-[#C9A227] bg-gradient-to-br from-[#C9A227]/10 to-[#C9A227]/5' : 'border-white/10 bg-white/[0.02]'} backdrop-blur-xl hover:border-[#C9A227]/40 transition-all group`}
                  >
                    {!cat.featured && (
                      <div className="text-xs font-bold text-[#C9A227]/50 mb-2">#{cat.id}</div>
                    )}
                    <h4 className={`font-bold mb-2 ${cat.featured ? 'text-[#C9A227] text-lg' : 'text-white text-base'}`}>
                      {cat.name}
                    </h4>
                    <p className="text-sm text-gray-500">{cat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to={createPageUrl("Categories")}>
            <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold">
              Ver todas las categorías en detalle
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FinalistasSlide() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Trophy className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-4">Finalistas 2026</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Los mejores casos clínicos seleccionados por nuestro jurado experto
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/5 backdrop-blur-xl mb-8">
            <Clock className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[#C9A227] font-medium">Anuncio de finalistas: Agosto 2026</span>
          </div>

          <p className="text-gray-500 mb-12">
            Una vez completada la evaluación del jurado, aquí se publicarán todos los casos finalistas.
            La votación pública determinará a los ganadores en cada categoría.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, label: "Evaluación rigurosa", desc: "Criterios científicos estrictos" },
              { icon: Star, label: "Excelencia probada", desc: "Solo los mejores casos" },
              { icon: Users, label: "Votación transparente", desc: "Tu voto cuenta" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
              >
                <item.icon className="w-8 h-8 text-[#C9A227] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">{item.label}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12">
            <Link to={createPageUrl("Voting")}>
              <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold px-8 h-12">
                Ver casos aprobados
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function JuradoSlide() {
  const [jury, setJury] = React.useState([]);

  React.useEffect(() => {
    base44.entities.Jury.filter({ is_active: true })
      .then(data => setJury(data.sort((a, b) => a.order - b.order)))
      .catch(() => {});
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Users className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-4">Panel de Jurados</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Expertos internacionales de máximo prestigio evaluarán todos los casos con criterios rigurosos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jury.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-[#C9A227]/30 transition-all"
            >
              <div className="text-center">
                {member.photo_url ? (
                  <img 
                    src={member.photo_url} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-[#C9A227]/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[#C9A227]/10 flex items-center justify-center border-2 border-[#C9A227]/30">
                    <span className="text-[#C9A227] text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-[#C9A227] text-sm mb-2">{member.specialty}</p>
                <p className="text-gray-500 text-xs mb-3">{member.hospital} • {member.country}</p>
                {member.bio && (
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{member.bio}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StreamingSlide() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-20 px-4 sm:px-8">
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
          <Link to={createPageUrl("BuyTicket")}>
            <Button size="lg" className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-bold h-14 text-lg">
              Comprar Pase
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function PartnersSlide() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black py-20 px-4 sm:px-8">
      <div className="text-center">
        <Star className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
        <h2 className="text-5xl font-bold text-white mb-4">Partners</h2>
        <p className="text-gray-400">Colaboradores institucionales</p>
      </div>
    </section>
  );
}

function FAQSlide() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      q: "¿Quién puede participar en los premios?",
      a: "Cualquier oftalmólogo de España o Portugal puede enviar casos clínicos quirúrgicos. No hay restricciones de edad, especialidad o años de experiencia."
    },
    {
      q: "¿Cuáles son los criterios de evaluación?",
      a: "El jurado evalúa: Innovación técnica (1-10), Impacto clínico (1-10), Calidad de presentación (1-10) y Valor docente (1-10). La puntuación máxima es 40 puntos."
    },
    {
      q: "¿Puedo enviar más de un caso?",
      a: "Sí, puedes enviar múltiples casos en diferentes categorías. Cada caso se evalúa de forma independiente."
    },
    {
      q: "¿Cómo funciona la votación pública?",
      a: "Los casos aprobados por el jurado pasan a votación pública. Cada usuario puede votar una vez por categoría. El resultado final combina votación pública y evaluación del jurado."
    },
    {
      q: "¿Cuándo se anuncian los ganadores?",
      a: "Los ganadores se anunciarán durante la gala presencial del 23 de octubre de 2026 en Madrid, transmitida en streaming en vivo."
    },
    {
      q: "¿Qué incluye el pase de streaming?",
      a: "Acceso completo a la transmisión en vivo HD, chat en directo con la comunidad y acceso a repetición durante 48 horas."
    },
    {
      q: "¿Los pacientes deben dar consentimiento?",
      a: "Sí, es obligatorio contar con el consentimiento informado del paciente. Todos los datos deben estar anonimizados según RGPD."
    },
    {
      q: "¿Hay algún coste por enviar casos?",
      a: "No, el envío de casos clínicos es completamente gratuito. Solo se cobra por los tickets para asistir a la gala."
    }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <MessageSquare className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
          <p className="text-xl text-gray-400">Todo lo que necesitas saber sobre los premios</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-white font-semibold pr-4">{faq.q}</span>
                <ChevronRight className={`w-5 h-5 text-[#C9A227] flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">¿Tienes más preguntas?</p>
          <a href="mailto:info@ophthalmologyradar.com" className="text-[#C9A227] hover:text-[#E8C547] transition-colors">
            Contáctanos: info@ophthalmologyradar.com
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASlide() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black py-20 px-4 sm:px-8">
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
              <Button size="lg" variant="outline" className="border-[#C9A227]/30 text-white hover:bg-[#C9A227]/10 hover:text-white px-12 h-16 text-lg bg-black/20">
                Explorar finalistas
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}