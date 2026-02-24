import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function InteractiveMediaGallery({ attachments = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [zoom, setZoom] = useState(1);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const openMedia = (index) => {
    setSelectedIndex(index);
    setZoom(1);
  };

  const closeMedia = () => {
    setSelectedIndex(null);
    setZoom(1);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
    setZoom(1);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const selectedMedia = selectedIndex !== null ? attachments[selectedIndex] : null;
  const selectedType = selectedMedia ? getFileType(selectedMedia) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#C9A227]" />
        Archivos Adjuntos ({attachments.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {attachments.map((url, index) => {
          const fileType = getFileType(url);
          return (
            <button
              key={index}
              onClick={() => openMedia(index)}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-[#C9A227]/50 transition-all group bg-white/5"
            >
              {fileType === 'image' ? (
                <img
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : fileType === 'pdf' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="w-12 h-12 text-[#C9A227] mb-2" />
                  <span className="text-xs text-gray-400">PDF</span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileText className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                {index + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Viewer */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeMedia}>
        <DialogContent className="max-w-7xl w-full h-[90vh] bg-black/95 border-white/10 p-0">
          <div className="relative w-full h-full flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {selectedIndex + 1} / {attachments.length}
                </span>
                {selectedType === 'image' && (
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleZoomOut}
                      className="text-white hover:text-[#C9A227] hover:bg-white/10"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleZoomIn}
                      className="text-white hover:text-[#C9A227] hover:bg-white/10"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedMedia}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:text-[#C9A227] hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeMedia}
                  className="text-white hover:text-red-400 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Media Content */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-16">
              {selectedType === 'image' ? (
                <img
                  src={selectedMedia}
                  alt={`Attachment ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                />
              ) : selectedType === 'pdf' ? (
                <iframe
                  src={selectedMedia}
                  className="w-full h-full rounded-lg"
                  title={`PDF ${selectedIndex + 1}`}
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Tipo de archivo no soportado</p>
                  <a
                    href={selectedMedia}
                    download
                    className="text-[#C9A227] hover:underline mt-2 inline-block"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {attachments.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {attachments.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                  {attachments.map((url, index) => {
                    const fileType = getFileType(url);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedIndex(index);
                          setZoom(1);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedIndex
                            ? "border-[#C9A227] scale-110"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {fileType === 'image' ? (
                          <img
                            src={url}
                            alt={`Thumb ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#C9A227]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}