import { useState, useRef, useEffect } from "react";

/**
 * LazyImage - Component for lazy loading images with intersection observer
 * Images only load when they enter the viewport
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div className={`bg-slate-700 animate-pulse ${className}`} />
  );

  // Error fallback
  const errorFallback = (
    <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
      <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  if (hasError) {
    return errorFallback;
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

/**
 * LazyImageGrid - Grid of lazy-loaded images with staggered loading
 */
export const LazyImageGrid = ({ 
  images, 
  columns = 3, 
  gap = 4,
  imageClassName = "",
  onImageClick = () => {}
}) => {
  return (
    <div 
      className={`grid gap-${gap}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {images.map((image, index) => (
        <div 
          key={image.id || index}
          className="cursor-pointer overflow-hidden rounded-lg"
          onClick={() => onImageClick(image, index)}
        >
          <LazyImage
            src={image.url || image.src}
            alt={image.alt || `Image ${index + 1}`}
            className={`w-full h-48 object-cover hover:scale-105 transition-transform duration-300 ${imageClassName}`}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * useInfiniteScroll - Hook for infinite scroll pagination
 */
export const useInfiniteScroll = (callback, hasMore) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "200px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        callback();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore]);

  return loadMoreRef;
};

/**
 * InfiniteScrollLoader - Component to trigger infinite scroll
 */
export const InfiniteScrollLoader = ({ onLoadMore, hasMore, loading }) => {
  const loadMoreRef = useInfiniteScroll(onLoadMore, hasMore && !loading);

  if (!hasMore) return null;

  return (
    <div 
      ref={loadMoreRef} 
      className="flex justify-center py-8"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="h-10" /> // Invisible trigger element
      )}
    </div>
  );
};

export default LazyImage;
