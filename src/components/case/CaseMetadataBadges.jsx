import React from "react";
import { Hospital, Globe, Stethoscope, Scissors, Tag, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CaseMetadataBadges({ 
  caseData, 
  variant = "default", // "default" | "compact" | "detailed"
  onFilter = null // Optional callback for filtering
}) {
  const metadata = [
    {
      icon: Tag,
      label: "Categoría",
      value: caseData.category_name,
      color: "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/20",
      filterKey: "category"
    },
    {
      icon: Hospital,
      label: "Hospital",
      value: caseData.hospital,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      filterKey: "hospital"
    },
    {
      icon: Globe,
      label: "País",
      value: caseData.country,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      filterKey: "country"
    },
    {
      icon: Stethoscope,
      label: "Especialidad",
      value: caseData.specialty,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      filterKey: "specialty"
    },
    {
      icon: Scissors,
      label: "Tipo de Cirugía",
      value: caseData.surgery_type,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      filterKey: "surgery_type"
    }
  ].filter(item => item.value);

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        {metadata.map((item, index) => (
          <Badge
            key={index}
            className={`${item.color} border cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => onFilter && onFilter(item.filterKey, item.value)}
          >
            <item.icon className="w-3 h-3 mr-1" />
            {item.value}
          </Badge>
        ))}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metadata.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl border ${item.color} ${
              onFilter ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""
            }`}
            onClick={() => onFilter && onFilter(item.filterKey, item.value)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-70 mb-0.5">{item.label}</p>
                <p className="font-semibold truncate">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Additional metadata */}
        {caseData.created_date && (
          <div className="p-3 rounded-xl border bg-gray-500/10 text-gray-400 border-gray-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-70 mb-0.5">Fecha de Envío</p>
                <p className="font-semibold truncate">
                  {new Date(caseData.created_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {caseData.created_by && (
          <div className="p-3 rounded-xl border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-70 mb-0.5">Cirujano</p>
                <p className="font-semibold truncate">{caseData.created_by}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-3">
      {metadata.map((item, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-2.5 rounded-lg border ${item.color} ${
            onFilter ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""
          }`}
          onClick={() => onFilter && onFilter(item.filterKey, item.value)}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs opacity-70 block">{item.label}</span>
            <span className="font-medium truncate block">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}