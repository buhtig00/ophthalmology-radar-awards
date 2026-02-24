import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Award, MapPin, Building2, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Jury() {
  const { data: juryMembers, isLoading } = useQuery({
    queryKey: ['jury'],
    queryFn: () => base44.entities.Jury.filter({ is_active: true }, 'order'),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1320] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1320] to-[#0a0e1a]">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A227]/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 mb-6">
            <Award className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[#C9A227] text-sm font-medium">Jurado de Expertos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Nuestro Jurado
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Reconocidos especialistas en oftalmología de todo el mundo evalúan los casos con los más altos estándares profesionales
          </p>
        </motion.div>
      </div>

      {/* Jury Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {juryMembers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">El jurado será anunciado próximamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {juryMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0a0e1a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#C9A227]/30 transition-all group"
              >
                {/* Photo */}
                <div className="relative h-64 bg-gradient-to-b from-[#C9A227]/10 to-transparent overflow-hidden">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#C9A227]/20 flex items-center justify-center">
                        <span className="text-4xl text-[#C9A227] font-bold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C9A227] transition-colors">
                    {member.name}
                  </h3>
                  
                  {member.title && (
                    <p className="text-[#C9A227] text-sm font-medium mb-3">
                      {member.title}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {member.specialty && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Award className="w-4 h-4 text-[#C9A227]/60" />
                        <span>{member.specialty}</span>
                      </div>
                    )}
                    {member.hospital && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Building2 className="w-4 h-4 text-[#C9A227]/60" />
                        <span className="line-clamp-1">{member.hospital}</span>
                      </div>
                    )}
                    {member.country && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Globe className="w-4 h-4 text-[#C9A227]/60" />
                        <span>{member.country}</span>
                      </div>
                    )}
                  </div>

                  {member.bio && (
                    <p className="text-gray-500 text-sm line-clamp-4 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}