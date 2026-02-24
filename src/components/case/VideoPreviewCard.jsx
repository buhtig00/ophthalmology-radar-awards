import React, { useState, useRef } from "react";
import { Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoPreviewCard({ videoUrl, poster, title, onClick }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowPreview(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Poster Image */}
      {poster && !showPreview && (
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* Preview Video (auto-plays on hover) */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          showPreview ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-16 h-16 rounded-full bg-[#C9A227]/90 backdrop-blur-xl flex items-center justify-center transition-all duration-300 ${
            isHovering ? "scale-110 bg-[#E8C547]" : "scale-100"
          }`}
        >
          <Play className="w-8 h-8 text-black ml-1" />
        </div>
      </div>

      {/* Full View Button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>

      {/* Hover Indicator */}
      {isHovering && !showPreview && (
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <div className="text-xs text-white/80 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full inline-block">
            Mantén el cursor para previsualizar
          </div>
        </div>
      )}
    </div>
  );
}