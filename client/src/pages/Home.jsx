import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, TrendingUp, ShieldCheck, Zap, Truck, X, ChevronLeft, ChevronRight as ChevronRightIcon, Volume2, VolumeX, Pause, Play, Send, Heart } from 'lucide-react';
import api from '../utils/axios';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Layout/Navbar';
import CartAddedModal from '../components/CartAddedModal';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';

/**
 * PAPUÇ GENÇ - STREET STYLE E-COMMERCE
 * %100 Responsive, Mobile-First, Scroll-Driven Hero, Instagram Stories
 */

// --- COMPONENTS ---

// 4. Product Card Component (Hover Video Logic + Numara Seçimi Zorunlu - Her renk ayrı kart)
const ProductCard = ({ product, colorIndex = 0, onCartAdded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedCardSize, setSelectedCardSize] = useState(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Belirtilen rengin görsellerini al
  const currentColor = product.colors?.[colorIndex];
  const images = currentColor?.images || [];
  const hoverVideo = currentColor?.hoverVideo || '';
  const mainImage = getImageUrl(images[0]) || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
  const hoverImage = getImageUrl(images[1] || images[0]) || mainImage;

  // Tüm renk hex kodlarını al
  const colorHexes = product.colors?.map(color => color.hexCode || '#ffffff') || ['#ffffff'];

  // Bu renk için mevcut numaraları al
  const availableSizes = currentColor?.sizes?.filter(s => s.stock > 0).map(s => s.size) || [];

  // Fiyat hesaplama
  const hasDiscount = product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price;
  const displayPrice = hasDiscount ? Math.min(product.price, product.originalPrice) : product.price;
  const strikethroughPrice = hasDiscount ? Math.max(product.price, product.originalPrice) : null;

  // Tag belirleme
  const getTag = () => {
    if (product.category?.includes('İNDİRİM') || product.category?.includes('FIRSAT')) {
      return product.category;
    }
    if (product.isFeatured) {
      return 'ÇOK SATAN';
    }
    return null;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentColor || !currentColor.sizes || currentColor.sizes.length === 0) {
      navigate(`/product/${product._id}?color=${colorIndex}`);
      return;
    }

    // Numara seçimi zorunlu
    if (!selectedCardSize) {
      setShowSizeSelector(true);
      setSizeWarning(true);
      setTimeout(() => setSizeWarning(false), 2000);
      return;
    }

    addToCart({
      productId: product._id,
      product: product,
      selectedColor: currentColor.colorName || colorHexes[colorIndex] || colorHexes[0],
      selectedSize: selectedCardSize,
      quantity: 1,
      price: displayPrice,
      originalPrice: strikethroughPrice || displayPrice,
      image: mainImage
    });

    // Modal göster
    onCartAdded?.({
      name: product.name,
      image: mainImage,
      selectedColor: currentColor.colorName || colorHexes[colorIndex] || colorHexes[0],
      selectedSize: selectedCardSize,
      price: displayPrice,
    });

    // Reset
    setSelectedCardSize(null);
    setShowSizeSelector(false);
  };

  const handleSizeSelect = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCardSize(size);
    setSizeWarning(false);
  };

  const handleSizeSelectorToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizeSelector(!showSizeSelector);
  };

  const handleCardClick = () => {
    if (!showSizeSelector) {
      navigate(`/product/${product._id}?color=${colorIndex}`);
    }
  };

  return (
    <div 
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); if(!selectedCardSize) setShowSizeSelector(false); }}
      onClick={handleCardClick}
    >
      {/* Badge */}
      {getTag() && (
        <div className={`absolute top-2 left-2 z-20 text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider ${getTag().includes('İNDİRİM') || getTag().includes('TL') || getTag().includes('FIRSAT') ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
          {getTag()}
        </div>
      )}

      {/* Renk ismi badge */}
      {currentColor?.colorName && (
        <div className="absolute top-2 right-2 z-20 text-[9px] md:text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
          {currentColor.colorName}
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-sm mb-3">
        {isHovered && hoverVideo ? (
          <video
            src={hoverVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out scale-110"
          />
        ) : (
          <img 
            src={isHovered ? hoverImage : mainImage} 
            alt={`${product.name} - ${currentColor?.colorName || ''} - ${product.brand?.name || ''} Ayakkabı`} 
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        )}

        {/* Numara Seçici Popup */}
        {showSizeSelector && availableSizes.length > 0 && (
          <div 
            className="absolute bottom-12 left-0 w-full bg-white/95 backdrop-blur-sm p-3 z-20 animate-slideUp shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className={`text-[10px] font-bold mb-2 text-center tracking-wider ${sizeWarning ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
              {sizeWarning ? '⚠ LÜTFEN NUMARA SEÇİN' : 'NUMARA SEÇ'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Array.from({ length: 9 }, (_, i) => 36 + i).map(size => {
                const isAvailable = availableSizes.includes(size);
                const isSelected = selectedCardSize === size;
                return (
                  <button
                    key={size}
                    onClick={(e) => isAvailable && handleSizeSelect(e, size)}
                    disabled={!isAvailable}
                    className={`w-9 h-9 text-[11px] font-bold rounded transition-all ${
                      isSelected
                        ? 'bg-black text-white scale-110'
                        : isAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-black hover:text-white'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Quick Add Button */}
        <button 
          onClick={selectedCardSize ? handleAddToCart : handleSizeSelectorToggle}
          className={`absolute bottom-0 left-0 w-full py-3 font-bold text-xs tracking-widest md:translate-y-full md:group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
            selectedCardSize 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-black text-white'
          }`}
        >
          <ShoppingBag className="w-3 h-3" /> 
          {selectedCardSize ? `${selectedCardSize} NUMARA - SEPETE EKLE` : 'NUMARA SEÇ'}
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1 px-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm md:text-base leading-tight group-hover:underline decoration-1 underline-offset-4">{product.name}</h3>
          <span className="text-gray-500 text-xs font-semibold">{product.brand?.name || product.brand || ''}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-gray-400 line-through text-xs md:text-sm font-medium">₺{strikethroughPrice.toLocaleString('tr-TR')}</span>
          )}
          <span className={`font-bold text-sm md:text-base ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>₺{displayPrice.toLocaleString('tr-TR')}</span>
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              %{Math.round((1 - displayPrice / strikethroughPrice) * 100)}
            </span>
          )}
        </div>

        {/* Color Dots - aktif rengi vurgula */}
        <div className="flex gap-1 pt-1">
          {colorHexes.slice(0, 5).map((color, i) => (
             <div key={i} className={`w-3 h-3 rounded-full border ${i === colorIndex ? 'border-black ring-1 ring-black ring-offset-1' : 'border-gray-300'}`} style={{backgroundColor: color}}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Stories Component
const Stories = ({ stories, onStoryClick }) => {
  const scrollRef = useRef(null);
  if (!stories || stories.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-5 md:py-8">
      <div className="container mx-auto px-4 relative">
        <div ref={scrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {stories.map((story) => (
            <button
              key={story._id}
              onClick={() => onStoryClick(story)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className="w-[68px] h-[68px] md:w-20 md:h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-black">
                  {story.mediaType === 'video' ? (
                    <video src={story.imageUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={story.imageUrl} alt={story.title || 'Hikaye'} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
              </div>
              {story.title && (
                <span className="text-[10px] md:text-xs font-medium text-gray-600 max-w-[68px] md:max-w-[80px] truncate text-center">
                  {story.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// 6. Story Viewer Modal - Instagram Style
const STORY_DURATION = 10000; // 10 saniye
const WHATSAPP_NUMBER = '905382435024';

const StoryViewer = ({ story, stories, onClose, onNavigate }) => {
  const currentIndex = stories.findIndex(s => s._id === story._id);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const rafRef = useRef(null);

  const isVideo = story.mediaType === 'video';
  const paused = isPaused || inputFocused;

  // Reset on story change
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
  }, [story._id]);

  // Progress loop (image timer); video uses its own time
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (paused) {
      // freeze elapsed
      elapsedRef.current = elapsedRef.current + (Date.now() - startTimeRef.current);
      return;
    }
    startTimeRef.current = Date.now();

    const tick = () => {
      if (isVideo && videoRef.current && videoRef.current.duration) {
        const v = videoRef.current;
        const pct = Math.min(100, (v.currentTime / v.duration) * 100);
        setProgress(pct);
        if (v.ended || pct >= 100) {
          handleNext();
          return;
        }
      } else {
        const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
        const pct = Math.min(100, (elapsed / STORY_DURATION) * 100);
        setProgress(pct);
        if (pct >= 100) {
          handleNext();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, story._id, isVideo]);

  // Video pause/play sync
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    if (paused) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [paused, isVideo, story._id]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) onNavigate(stories[currentIndex - 1]);
  };
  const handleNext = () => {
    if (currentIndex < stories.length - 1) onNavigate(stories[currentIndex + 1]);
    else onClose();
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;
    const fullMessage = `Merhaba PAPUCGNC, hikayeniz hakkında: "${story.title || 'Hikaye'}"\n\n${text}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessage('');
    setInputFocused(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none" onClick={onClose}>
      {/* Sol üst PAPUÇGNC text logosu (sadece desktop) */}
      <div className="hidden md:block absolute top-0 left-0 z-20 pointer-events-none px-6 py-4">
        <span className="text-white font-black italic tracking-tight" style={{ fontSize: '5rem', lineHeight: 1 }}>
          PAPUÇ<span className="text-red-600">GNC</span>
        </span>
      </div>

      {/* Kapat butonu (desktop sağ üst) */}
      <button
        className="hidden md:block absolute top-6 right-6 text-white/90 hover:text-white z-20 p-2"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Kapat"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Desktop nav arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="hidden md:flex absolute left-4 lg:left-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white items-center justify-center z-20"
          aria-label="Önceki"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="hidden md:flex absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white items-center justify-center z-20"
          aria-label="Sonraki"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Story Container - 9:16 */}
      <div
        className="relative w-full h-full md:h-[90vh] md:w-auto md:aspect-[9/16] md:max-h-[90vh] md:rounded-2xl bg-black overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        {isVideo ? (
          <video
            ref={videoRef}
            key={story._id}
            src={story.imageUrl}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            playsInline
            muted={isMuted}
            onLoadedMetadata={() => {
              startTimeRef.current = Date.now();
              elapsedRef.current = 0;
            }}
          />
        ) : (
          <img
            src={story.imageUrl}
            alt={story.title || ''}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        )}

        {/* Top gradient + progress bars + header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent pt-2 pb-6 px-3">
          {/* Progress bars */}
          <div className="flex gap-1 mb-3">
            {stories.map((s, i) => (
              <div key={s._id} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                    transition: i === currentIndex ? 'none' : 'width 0.2s',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header: avatar + title + controls */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                <img
                  src="/logo.png"
                  alt=""
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] max-w-none object-contain pointer-events-none"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">papucgnc</p>
              {story.title && (
                <p className="text-white/80 text-xs truncate">{story.title}</p>
              )}
            </div>

            {/* Mute (only video) */}
            {isVideo && (
              <button
                onClick={() => setIsMuted(m => !m)}
                className="text-white p-2 hover:bg-white/10 rounded-full"
                aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}

            {/* Pause/Play */}
            <button
              onClick={() => setIsPaused(p => !p)}
              className="text-white p-2 hover:bg-white/10 rounded-full"
              aria-label={isPaused ? 'Oynat' : 'Duraklat'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            {/* Close (mobile) */}
            <button
              onClick={onClose}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-full"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tap zones (sol/sağ tıklama) - alt input alanına çakışmaz */}
        <div className="absolute inset-0 z-[5] flex" style={{ top: '70px', bottom: '90px' }}>
          <button
            type="button"
            className="flex-1 h-full focus:outline-none"
            onClick={handlePrev}
            aria-label="Önceki hikaye"
          />
          <button
            type="button"
            className="flex-1 h-full focus:outline-none"
            onClick={handleNext}
            aria-label="Sonraki hikaye"
          />
        </div>

        {/* "Daha Fazla" link button (üstte taps zone'unun üstünde) */}
        {story.link && (
          <a
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            Daha Fazla
          </a>
        )}

        {/* Bottom message bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-4 pt-8 bg-gradient-to-t from-black/70 to-transparent">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => { if (!message) setInputFocused(false); }}
                placeholder="papucgnc'ye sor..."
                className="w-full bg-transparent border border-white/40 focus:border-white text-white placeholder-white/70 rounded-full pl-5 pr-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>
            {message.trim() ? (
              <button
                type="submit"
                className="text-white p-2.5 hover:bg-white/10 rounded-full"
                aria-label="WhatsApp'tan gönder"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button type="button" className="text-white p-2.5 hover:bg-white/10 rounded-full" aria-label="Beğen" onClick={(e) => e.preventDefault()}>
                  <Heart className="w-6 h-6" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// 7. Features Section
const Features = () => (
  <section className="py-12 border-t border-b border-gray-200 bg-white">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { icon: <TrendingUp />, title: "Premium Kalite", desc: "1. Sınıf Malzeme" },
        { icon: <Truck />, title: "Hızlı Kargo", desc: "2-3 İş Günü" },
        { icon: <ShieldCheck />, title: "Güvenli Ödeme", desc: "256-bit SSL" },
        { icon: <Zap />, title: "7/24 Destek", desc: "Müşteri Hizmetleri" },
      ].map((feature, idx) => (
        <div key={idx} className="flex flex-col items-center text-center space-y-2">
          <div className="bg-gray-100 p-3 rounded-full mb-2">{feature.icon}</div>
          <h4 className="font-bold text-sm md:text-base">{feature.title}</h4>
          <p className="text-xs text-gray-500">{feature.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// 8. Main Home Component
const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalItem, setCartModalItem] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const heroSlides = [
    { src: '/hero-section.webp', position: 'center 60%' },
    { src: '/slider2.JPEG', position: 'center 35%' },
    { src: '/slider-3.JPEG', position: 'center 35%' },
  ];
  const visibleSlides = isMobile ? [heroSlides[0]] : heroSlides;
  const navigate = useNavigate();

  const handleCartAdded = useCallback((item) => {
    setCartModalItem(item);
    setCartModalOpen(true);
  }, []);

  // Scroll listener + resize listener
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hero slider auto-rotation (3 saniye) - sadece desktop
  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isMobile]);

  useEffect(() => {
    fetchProducts();
    fetchStories();
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const sorted = response.data.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (a.featuredAt && b.featuredAt) return new Date(a.featuredAt) - new Date(b.featuredAt);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      const expanded = sorted.flatMap(product => {
        const colors = product.colors || [];
        if (colors.length <= 1) return [{ product, colorIndex: 0 }];
        return colors.map((_, colorIndex) => ({ product, colorIndex }));
      });
      setAllProducts(expanded);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories');
      setStories(response.data);
    } catch (error) {
      console.error('Hikayeler yüklenirken hata:', error);
    }
  };

  // Hero scroll animation values
  const maxScroll = 350;
  const progress = Math.min(scrollY / maxScroll, 1);
  const heroPaddingX = Math.round((isMobile ? 10 : 20) * (1 - progress));
  const heroPaddingTop = Math.round((isMobile ? 8 : 30) * (1 - progress));
  const heroPaddingBottom = Math.round((isMobile ? 24 : 30) * (1 - progress));
  const heroBorderRadius = Math.round(48 * (1 - progress));

  // Split products
  const featuredProducts = allProducts.filter(item => item.product.isFeatured).slice(0, 8);
  const moreProducts = allProducts.slice(0, 16);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEO
        title="Ana Sayfa"
        description="PAPUÇGNC - Sokağın ritmini yakala! Nike, Adidas, Vans, Puma, New Balance ve daha fazla markanın en yeni ayakkabı modelleri. Uygun fiyat, hızlı kargo, kapıda ödeme."
        keywords="ayakkabı, sneakers, spor ayakkabı, nike, adidas, vans, puma, new balance, online ayakkabı mağazası, papuçgnc"
        url="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "PAPUÇGNC",
          "description": "Sokağın ritmini yakala! En yeni ayakkabı modelleri.",
          "url": "https://papucgnc.com",
          "image": "https://papucgnc.com/logo.png",
          "priceRange": "₺₺",
          "currenciesAccepted": "TRY",
          "paymentAccepted": "Cash, Credit Card, Bank Transfer",
          "openingHours": "Mo-Su 00:00-23:59"
        }}
      />
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-fadeInUp { animation: fadeInUp 1s ease-out forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.15s; }
        .reveal-delay-2 { transition-delay: 0.3s; }
        .reveal-delay-3 { transition-delay: 0.45s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.2s ease-out; }
      `}</style>

      <Navbar />

      {/* ===== HERO (fixed behind, animated padding/border-radius + slider) ===== */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 transition-[padding] duration-100 ease-out" style={{ padding: `${heroPaddingTop}px ${heroPaddingX}px ${heroPaddingBottom}px` }}>
        <section className="relative w-full h-full overflow-hidden flex items-center justify-center bg-gray-900 transition-[border-radius] duration-100 ease-out" style={{ borderRadius: `${heroBorderRadius}px` }}>
          {/* Slider Images (mobile: sadece ilk görsel, desktop: slider) */}
          {visibleSlides.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === currentSlide ? 1 : 0 }}
            >
              <img
                src={slide.src}
                alt={`PAPUÇGNC Slider ${idx + 1}`}
                className="w-full h-full object-cover"
                style={{ objectPosition: slide.position }}
                fetchPriority={idx === 0 ? 'high' : 'low'}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/30 z-[1]" />

          {/* Content */}
          <div className="relative z-10 container mx-auto px-5 md:px-8 text-center md:text-left md:flex md:items-center h-full flex items-center">
            <div className="md:w-3/5 lg:w-1/2 flex flex-col items-center md:items-start space-y-3 md:space-y-5 w-full">
              <span className="inline-block px-3 py-1.5 bg-white/15 backdrop-blur-md text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-white/20">
                Yeni Sezon Koleksiyonu
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight drop-shadow-2xl">
                SOKAĞIN <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">RİTMİNİ</span> <br/>
                YAKALA.
              </h1>
              <p className="text-gray-200/90 text-xs md:text-base max-w-sm md:max-w-md font-medium drop-shadow-md">
                Zamansız tasarımlar, üstün kalite. Tarzını yansıtan ayakkabılarla tanış.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
                <button onClick={() => navigate('/store')} className="bg-white text-black px-6 py-3 md:px-8 md:py-4 font-black text-xs md:text-sm tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center justify-center gap-2 rounded-xl">
                  KEŞFETMEYE BAŞLA <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Slider Indicators - sadece desktop */}
          {!isMobile && visibleSlides.length > 1 && (
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {visibleSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Hero spacer */}
      <div className="h-screen" />

      {/* ===== CONTENT (slides over hero like a drawer) ===== */}
      <div className="relative z-10 bg-white" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px' }}>

        {/* --- STORIES --- */}
        <Stories stories={stories} onStoryClick={setActiveStory} />

        {/* --- ÖNE ÇIKAN ÜRÜNLER --- */}
        <section className="py-8 md:py-16 container mx-auto px-4">
          <div className="flex justify-between items-end mb-6 md:mb-10 reveal">
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Öne Çıkanlar</h2>
              <p className="text-gray-400 text-sm mt-1">En popüler modeller</p>
            </div>
            <button onClick={() => navigate('/store')} className="flex items-center gap-1.5 text-sm font-bold border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors">
              TÜMÜ <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {featuredProducts.map((item, idx) => (
                <div key={`f-${item.product._id}-${item.colorIndex}`} className={`reveal reveal-delay-${(idx % 4) + 1}`}>
                  <ProductCard product={item.product} colorIndex={item.colorIndex} onCartAdded={handleCartAdded} />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* --- KAMPANYA BANNERI (güncel) --- */}
        <section className="mx-4 md:mx-8 rounded-2xl md:rounded-3xl bg-black text-white py-10 md:py-16 mb-8 md:mb-16 overflow-hidden relative">
          <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left reveal">
              <span className="text-red-500 font-bold tracking-widest text-xs md:text-sm">ÖZEL KAMPANYA</span>
              <h2 className="text-3xl md:text-5xl font-black mt-2 mb-3">2 ÇİFT <span className="text-red-500">1.199 ₺</span></h2>
              <p className="text-gray-400 max-w-md mb-5 text-sm">İki çift al, dev indirimden faydalan. Arkadaşınla paylaş ya da kendine bir güzellik yap.</p>
              <button onClick={() => navigate('/store')} className="bg-white text-black px-6 py-3 font-bold text-sm hover:bg-gray-200 transition-colors rounded-lg">
                KAMPANYAYA GİT
              </button>
            </div>
            <div className="w-full md:w-1/3 h-48 md:h-64 relative overflow-hidden rounded-xl reveal reveal-delay-1">
              <img src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Kampanya" loading="lazy" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-5 py-3 font-black text-base md:text-lg rotate-3 shadow-xl whitespace-nowrap rounded-lg">
                SINIRLI SÜRE!
              </div>
            </div>
          </div>
        </section>

        {/* --- TÜM ÜRÜNLER --- */}
        <section className="py-8 md:py-16 container mx-auto px-4">
          <div className="flex justify-between items-end mb-6 md:mb-10 reveal">
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Mağaza</h2>
              <p className="text-gray-400 text-sm mt-1">Tüm ürünlerimizi keşfedin</p>
            </div>
            <button onClick={() => navigate('/store')} className="flex items-center gap-1.5 text-sm font-bold border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors">
              TÜMÜNÜ GÖR <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : moreProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {moreProducts.map((item, idx) => (
                <div key={`m-${item.product._id}-${item.colorIndex}`} className={`reveal reveal-delay-${(idx % 4) + 1}`}>
                  <ProductCard product={item.product} colorIndex={item.colorIndex} onCartAdded={handleCartAdded} />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-10 text-center reveal">
            <button onClick={() => navigate('/store')} className="border border-black px-10 py-3 font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all rounded-lg">
              TÜM ÜRÜNLERİ GÖR
            </button>
          </div>
        </section>

        {/* --- TRUST --- */}
        <Features />

        {/* --- FOOTER --- */}
        <footer className="bg-gray-900 text-white pt-16 pb-8">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-black italic mb-6">PAPUÇ<span className="text-red-600">GNC</span>.</div>
              <p className="text-gray-400 text-sm">Sokağın ritmini yakalayan, tarz sahibi gençler için premium ayakkabı deneyimi.</p>
              <div className="flex gap-4 mt-6">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer text-sm font-bold">IG</div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer text-sm font-bold">TW</div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer text-sm font-bold">TT</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">ALIŞVERİŞ</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/store" className="hover:text-white">Yeni Sezon</Link></li>
                <li><Link to="/store" className="hover:text-white">Çok Satanlar</Link></li>
                <li><Link to="/store" className="hover:text-white">İndirimler</Link></li>
                <li><Link to="/store" className="hover:text-white">Kampanyalar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">DESTEK</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="#" className="hover:text-white">Sipariş Takibi</Link></li>
                <li><Link to="#" className="hover:text-white">İade ve Değişim</Link></li>
                <li><Link to="#" className="hover:text-white">Sıkça Sorulan Sorular</Link></li>
                <li><Link to="#" className="hover:text-white">İletişim</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-lg mb-6">BÜLTEN</h4>
              <p className="text-gray-400 text-sm mb-4">Özel indirimlerden ilk senin haberin olsun.</p>
              <div className="flex">
                <input type="email" placeholder="E-posta adresi" className="bg-gray-800 text-white px-4 py-3 w-full outline-none focus:ring-1 focus:ring-white text-sm rounded-l-lg" />
                <button className="bg-white text-black px-4 font-bold text-sm hover:bg-gray-200 rounded-r-lg">KAYIT</button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2026 PAPUÇGNC. Tüm hakları saklıdır.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-white">Gizlilik Politikası</span>
              <span className="cursor-pointer hover:text-white">Kullanım Şartları</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Story Viewer */}
      {activeStory && (
        <StoryViewer
          story={activeStory}
          stories={stories}
          onClose={() => setActiveStory(null)}
          onNavigate={setActiveStory}
        />
      )}

      {/* Sepete Ekleme Modalı */}
      <CartAddedModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        item={cartModalItem}
      />
    </div>
  );
};

export default Home;
