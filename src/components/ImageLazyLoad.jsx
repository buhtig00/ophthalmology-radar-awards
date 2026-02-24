import React, { useState, useEffect, useRef } from "react";

export default function ImageLazyLoad({ 
  src, 
  alt, 
  className = "", 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23111827' width='400' height='300'/%3E%3C/svg%3E",
  quality = "auto" // auto, low, medium, high
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Optimize image URL based on quality setting
  const getOptimizedUrl = (url) => {
    if (!url || url.startsWith('data:')) return url;
    
    // For Supabase URLs, add transformation parameters
    if (url.includes('supabase.co')) {
      const separator = url.includes('?') ? '&' : '?';
      const qualityMap = {
        low: 50,
        medium: 75,
        high: 90,
        auto: 80
      };
      return `${url}${separator}quality=${qualityMap[quality]}&format=webp`;
    }
    
    return url;
  };

  useEffect(() => {
    let observer;
    const imgElement = imgRef.current;

    if (imgElement && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Preload the image
              const img = new Image();
              img.src = getOptimizedUrl(src);
              img.onload = () => {
                setImageSrc(getOptimizedUrl(src));
                setIsLoaded(true);
              };
              img.onerror = () => {
                setHasError(true);
                setIsLoaded(true);
              };
              
              observer.unobserve(imgElement);
            }
          });
        },
        {
          rootMargin: "100px", // Start loading earlier
          threshold: 0.01
        }
      );

      observer.observe(imgElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(getOptimizedUrl(src));
    }

    return () => {
      if (observer && imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, [src, quality]);

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 text-gray-500`}>
        <span className="text-sm">Error al cargar imagen</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}