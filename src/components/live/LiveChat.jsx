import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageSquare, Shield } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveChat({ user }) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["liveMessages"],
    queryFn: () => base44.entities.LiveMessage.list("-created_date", 100),
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msgData) => base44.entities.LiveMessage.create(msgData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveMessages"] });
      setMessage("");
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      user_name: user?.full_name || user?.email || "Anónimo",
      is_admin: user?.role === "admin",
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="bg-white/[0.02] border-white/10 h-[600px] flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#C9A227]" />
          <h3 className="text-white font-semibold">Chat en Vivo</h3>
          <span className="ml-auto text-xs text-gray-500">
            {messages.length} mensajes
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.reverse().map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg ${
                msg.is_admin
                  ? "bg-[#C9A227]/10 border border-[#C9A227]/20"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-start gap-2 mb-1">
                {msg.is_admin && (
                  <Shield className="w-3 h-3 text-[#C9A227] mt-0.5" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    msg.is_admin ? "text-[#C9A227]" : "text-white"
                  }`}
                >
                  {msg.user_name}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {msg.created_date &&
                    format(new Date(msg.created_date), "HH:mm")}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {msg.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-white/5 border-white/10 text-white"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Sé respetuoso y mantén la conversación profesional
        </p>
      </form>
    </Card>
  );
}