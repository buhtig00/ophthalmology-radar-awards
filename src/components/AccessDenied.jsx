import React from "react";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccessDenied({ requiredRole, requiredPermission }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-400 mb-2">
          No tienes permisos para acceder a esta sección.
        </p>
        
        {requiredRole && (
          <p className="text-sm text-gray-500 mb-6">
            Rol requerido: <span className="font-semibold text-[#C9A227]">{requiredRole}</span>
          </p>
        )}
        
        {requiredPermission && (
          <p className="text-sm text-gray-500 mb-6">
            Permiso requerido: <span className="font-semibold text-[#C9A227]">{requiredPermission}</span>
          </p>
        )}
        
        <Link to={createPageUrl("Home")}>
          <Button className="bg-[#C9A227] hover:bg-[#E8C547] text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}