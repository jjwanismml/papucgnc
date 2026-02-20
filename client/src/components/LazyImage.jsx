import { useState, useRef, useEffect, memo } from 'react';

/**
 * LazyImage - Intersection Observer ile lazy loading yapan optimized resim bileşeni
 * - Viewport'a girene kadar resmi yüklemez
 * - Blur-up placeholder efekti
 * - Native lazy loading fallback
 * - WebP desteği
 */
const LazyImage = memo(({ 
  src, 
  alt = '', 
  className = '', 
  wrapperClassName = '',
  placeholderColor = '#f3f4f6',
  threshold = 0.1,
  rootMargin = '200px 0px',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    // Intersection Observer desteği yoksa direkt göster
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return (
    <div 
      ref={imgRef}
      className={`overflow-hidden ${wrapperClassName}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
          Görsel yüklenemedi
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

