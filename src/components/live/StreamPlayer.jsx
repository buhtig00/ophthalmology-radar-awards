import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tv, Play, Settings } from "lucide-react";

export default function StreamPlayer({ isAdmin = false }) {
  const [streamUrl, setStreamUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Check localStorage for saved URL
  React.useEffect(() => {
    const saved = localStorage.getItem("live_stream_url");
    if (saved) {
      setSavedUrl(saved);
      setStreamUrl(saved);
    }
  }, []);

  const handleSaveUrl = () => {
    localStorage.setItem("live_stream_url", streamUrl);
    setSavedUrl(streamUrl);
    setShowSettings(false);
  };

  const getEmbedUrl = (url) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    // Return as-is if already an embed URL or unsupported
    return url;
  };

  if (isAdmin && showSettings) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-[#C9A227]" />
            <h3 className="text-white font-semibold">
              Configurar URL de Streaming
            </h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Introduce la URL del streaming en vivo (YouTube Live, Vimeo, etc.)
          </p>
          <div className="space-y-4">
            <Input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveUrl}
                className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
              >
                Guardar URL
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-white/10 relative">
      {isAdmin && (
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur text-white hover:bg-black/70"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
          {savedUrl ? (
            <iframe
              className="w-full h-full absolute inset-0"
              src={getEmbedUrl(savedUrl)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8">
              <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                Reproductor de transmisión en vivo
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {isAdmin
                  ? "Haz clic en configuración para añadir la URL del streaming"
                  : "El streaming comenzará pronto"}
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227]/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Streaming
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}