import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Tv, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format, isBefore, isAfter } from "date-fns";

export default function LiveStream() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: eventConfig } = useQuery({
    queryKey: ["eventConfig"],
    queryFn: async () => {
      const configs = await base44.entities.EventConfig.list();
      return configs[0];
    },
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ["myTickets", user?.email],
    queryFn: () => base44.entities.Ticket.filter({ created_by: user.email, paid: true }),
    enabled: !!user,
  });

  const hasValidPass = myTickets.some(t => 
    (t.type === "streaming" || t.type === "vip") && t.paid
  );

  const eventDate = eventConfig?.event_date ? new Date(eventConfig.event_date) : null;
  const now = new Date();
  const isEventLive = eventDate && isBefore(now, new Date(eventDate.getTime() + 4 * 60 * 60 * 1000)) && isAfter(now, new Date(eventDate.getTime() - 30 * 60 * 1000));
  const isEventPast = eventDate && isAfter(now, new Date(eventDate.getTime() + 4 * 60 * 60 * 1000));
  const isEventFuture = eventDate && isBefore(now, new Date(eventDate.getTime() - 30 * 60 * 1000));

  // No logged in
  if (!user) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Lock className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">
              Transmisión en Vivo
            </h1>
            <p className="text-gray-400 mb-8">
              Debes iniciar sesión para acceder a la transmisión
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold"
            >
              Iniciar Sesión
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // No valid pass
  if (!hasValidPass) {
    return (
      <div className="p-6 sm:p-8 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Lock className="w-16 h-16 text-[#C9A227] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">
              Acceso Restringido
            </h1>
            <p className="text-gray-400 mb-2">
              Necesitas un pase válido para acceder a la transmisión en vivo
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Adquiere tu pase de streaming o VIP para no perderte la gala
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Card className="bg-white/[0.02] border-white/10 p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Tv className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Pase Streaming</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Acceso completo a la transmisión en vivo
                </p>
                <div className="text-2xl font-bold text-white mb-4">
                  €{((eventConfig?.streaming_price_cents || 2900) / 100).toFixed(2)}
                </div>
              </Card>
            </div>

            <Link to={createPageUrl("BuyTicket")}>
              <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black font-semibold">
                Comprar Pase
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Has valid pass but event not started yet
  if (isEventFuture) {
    return (
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Pase Válido
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Transmisión en Vivo
          </h1>
        </div>

        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <CardContent className="p-8 text-center">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              La transmisión aún no ha comenzado
            </h2>
            <p className="text-gray-400 mb-2">
              La gala será transmitida el:
            </p>
            <p className="text-[#C9A227] text-xl font-semibold mb-6">
              {eventDate && format(eventDate, "d 'de' MMMM 'de' yyyy 'a las' HH:mm")}
            </p>
            <p className="text-gray-500 text-sm">
              Te notificaremos cuando la transmisión esté disponible
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Event has ended
  if (isEventPast) {
    return (
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Transmisión Finalizada
          </h1>
        </div>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              La gala ha finalizado
            </h2>
            <p className="text-gray-400 mb-6">
              Gracias por participar en los Ophthalmology Radar Awards 2026
            </p>
            <p className="text-gray-500 text-sm">
              La repetición estará disponible próximamente
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Event is live - show stream
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500 text-white animate-pulse">
              ● EN VIVO
            </Badge>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Acceso Autorizado
            </Badge>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gala Ophthalmology Radar Awards 2026
        </h1>
        <p className="text-gray-400">
          Transmisión en vivo desde {eventConfig?.event_name || "el evento"}
        </p>
      </div>

      {/* Video Player */}
      <Card className="bg-black border-white/10 mb-6">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
            {/* Placeholder - replace with actual streaming embed */}
            <div className="text-center">
              <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                Reproductor de transmisión en vivo
              </p>
              <p className="text-gray-600 text-sm">
                Integra tu servicio de streaming aquí (YouTube Live, Vimeo, etc.)
              </p>
              {/* Example iframe for YouTube Live:
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/LIVE_VIDEO_ID"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat or Info Panel */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-white/[0.02] border-white/10">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Sobre la Gala
            </h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p>
                Bienvenido a la primera edición de los Ophthalmology Radar Awards, 
                donde celebramos la excelencia en cirugía oftalmológica.
              </p>
              <p>
                Durante la gala descubriremos a los ganadores de cada categoría, 
                reconociendo los mejores casos clínicos y técnicas quirúrgicas innovadoras.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Recursos
            </h3>
            <div className="space-y-3">
              <Link to={createPageUrl("Rankings")}>
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Rankings
                </Button>
              </Link>
              <Link to={createPageUrl("Categories")}>
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Categorías
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}