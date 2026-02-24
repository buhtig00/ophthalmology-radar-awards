import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Info, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AnnouncementsBanner() {
  const { data: announcements = [] } = useQuery({
    queryKey: ["liveAnnouncements"],
    queryFn: () =>
      base44.entities.LiveAnnouncement.filter(
        { is_active: true },
        "-created_date",
        10
      ),
    refetchInterval: 5000,
  });

  if (announcements.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "winner":
        return Trophy;
      case "milestone":
        return Star;
      default:
        return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "winner":
        return "from-[#C9A227] to-[#E8C547]";
      case "milestone":
        return "from-purple-500 to-pink-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <AnimatePresence>
        {announcements.map((announcement) => {
          const Icon = getIcon(announcement.type);
          const colorClass = getColor(announcement.type);

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <Card
                className={`bg-gradient-to-r ${colorClass} bg-opacity-10 border-none relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${colorClass}`}
                    >
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      {announcement.type === "winner" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-[#C9A227]" />
                          <span className="text-[#C9A227] text-sm font-semibold uppercase tracking-wide">
                            🏆 Ganador Anunciado
                          </span>
                        </div>
                      )}
                      <h3 className="text-white text-xl font-bold mb-1">
                        {announcement.title}
                      </h3>
                      {announcement.category_name && (
                        <p className="text-gray-300 text-sm mb-2">
                          Categoría: {announcement.category_name}
                        </p>
                      )}
                      {announcement.winner_name && (
                        <p className="text-white text-lg font-semibold mb-2">
                          👨‍⚕️ {announcement.winner_name}
                        </p>
                      )}
                      {announcement.description && (
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {announcement.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}