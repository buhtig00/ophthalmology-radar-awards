import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tv, Crown, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function BuyTicket() {
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(null);

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

  const handlePurchase = async (ticketType) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setProcessing(ticketType);

    try {
      const price = ticketType === "streaming" 
        ? (eventConfig?.streaming_price_cents || 2900)
        : (eventConfig?.vip_price_cents || 15000);

      // Create ticket
      const ticketCode = `TICKET-${ticketType.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const ticket = await base44.entities.Ticket.create({
        code: ticketCode,
        type: ticketType,
        type_name: ticketType === "streaming" ? "Streaming" : "VIP",
        price: price,
        paid: false,
      });

      // Create checkout session via backend
      const response = await base44.functions.invoke('createCheckoutSession', {
        ticketType,
        ticketId: ticket.id,
        userEmail: user.email
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Check if running in iframe
      if (window.self !== window.top) {
        window.open(response.data.url, '_blank');
        toast.success("Se ha abierto el checkout en una nueva pestaña");
      } else {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar el pago. Inténtalo de nuevo.");
      setProcessing(null);
    }
  };

  // Check for successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("¡Pago completado! Tu pase ha sido activado.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const hasStreamingPass = myTickets.some(t => t.type === "streaming" && t.paid);
  const hasVipPass = myTickets.some(t => t.type === "vip" && t.paid);

  const streamingPrice = (eventConfig?.streaming_price_cents || 2900) / 100;
  const vipPrice = (eventConfig?.vip_price_cents || 15000) / 100;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            Pases para la Gala
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Ophthalmology Radar Awards 2026
          </p>
          {eventConfig?.event_date && (
            <p className="text-[#C9A227] font-semibold">
              {format(new Date(eventConfig.event_date), "d 'de' MMMM 'de' yyyy")}
            </p>
          )}
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Streaming Pass */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/[0.02] border-white/10 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Tv className="w-6 h-6 text-blue-400" />
                </div>
                {hasStreamingPass && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Adquirido
                  </Badge>
                )}
              </div>
              <CardTitle className="text-white text-2xl">Pase Streaming</CardTitle>
              <CardDescription className="text-gray-400">
                Disfruta de la gala en vivo desde casa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  €{streamingPrice.toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm">Pago único</p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Acceso completo a la transmisión en vivo</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Calidad HD con múltiples cámaras</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Chat en vivo con otros participantes</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Repetición disponible 48h</span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchase("streaming")}
                disabled={hasStreamingPass || processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {processing === "streaming" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : hasStreamingPass ? (
                  "Ya tienes este pase"
                ) : (
                  "Comprar Pase"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* VIP Pass */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#C9A227]/10 to-transparent border-[#C9A227]/30 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Sparkles className="w-5 h-5 text-[#C9A227] animate-pulse" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#C9A227]/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#C9A227]" />
                </div>
                {hasVipPass && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Adquirido
                  </Badge>
                )}
              </div>
              <CardTitle className="text-white text-2xl">Pase VIP</CardTitle>
              <CardDescription className="text-gray-400">
                La experiencia completa presencial
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  €{vipPrice.toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm">Plazas limitadas</p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">Entrada presencial a la gala</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span>Asiento premium reservado</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span>Cocktail exclusivo pre-gala</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span>Networking con ponentes y jurado</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span>Pack de bienvenida premium</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                  <span>Acceso a streaming incluido</span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchase("vip")}
                disabled={hasVipPass || processing}
                className="w-full bg-[#C9A227] hover:bg-[#E8C547] text-black font-bold"
              >
                {processing === "vip" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : hasVipPass ? (
                  "Ya tienes este pase"
                ) : (
                  "Comprar Pase VIP"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-center"
        >
          <p className="text-yellow-400 mb-3">
            Debes iniciar sesión para comprar un pase
          </p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
          >
            Iniciar Sesión
          </Button>
        </motion.div>
      )}
    </div>
  );
}