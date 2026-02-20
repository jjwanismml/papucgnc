import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, ArrowRight, Heart, TrendingUp, ShieldCheck, Zap, Truck } from 'lucide-react';
import api from '../utils/axios';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Layout/Navbar';
import CartAddedModal from '../components/CartAddedModal';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';
import LazyImage from '../components/LazyImage';

/**
 * PAPUÇ GENÇ - STREET STYLE E-COMMERCE
 * %100 Responsive, Mobile-First, Street Rhythm
 */

// Kategoriler (Statik - API'de kategori endpoint'i yok)
const categories = [
  { name: "SNEAKERS", image: "/koleksiyon-kesfeti/koleksiyon1.webp", link: "/store?category=SNEAKERS" },
  { name: "CASUAL", image: "/koleksiyon-kesfeti/koleksiyon2.webp", link: "/store?category=CASUAL" },
  { name: "SPOR", image: "/koleksiyon-kesfeti/koleksiyon3.webp", link: "/store?category=SPOR" },
];

// --- COMPONENTS ---

// 1-2. Marquee + Navbar artık Navbar bileşeninde birleşik (Shared component)

// 3. Hero Section
const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section aria-label="Ana banner" className="relative h-[90vh] md:h-screen w-full overflow-hidden flex items-center justify-center bg-gray-100">
       {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-section.webp" 
          alt="PAPUÇGNC - Sokağın Ritmini Yakala - Street Style Ayakkabı Koleksiyonu" 
          className="w-full h-full object-cover opacity-90"
          style={{ objectPosition: 'center 40%' }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/20" /> 
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center md:text-left md:flex md:items-center md:justify-between h-full flex items-center justify-center">
        <div className="md:w-1/2 flex flex-col items-center md:items-start space-y-4 md:space-y-6 animate-fadeInUp w-full">
          <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs md:text-sm font-bold tracking-widest uppercase mb-2">
            Yeni Sezon Koleksiyonu
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-lg">
            SOKAĞIN <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">RİTMİNİ</span> <br/>
            YAKALA.
          </h1>
          <p className="text-gray-200 text-sm md:text-lg max-w-md md:max-w-lg font-medium drop-shadow-md">
            Zamansız tasarımlar, üstün kalite. Tarzını yansıtan ayakkabılarla tanış. Şehir seni bekliyor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <button onClick={() => navigate('/store')} className="bg-white text-black px-8 py-4 font-black text-sm md:text-base tracking-widest hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-2">
              KEŞFETMEYE BAŞLA <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/store')} className="border-2 border-white text-white px-8 py-4 font-black text-sm md:text-base tracking-widest hover:bg-white hover:text-black transition-all">
              KAMPANYALAR
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce hidden md:block">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white to-transparent mx-auto"></div>
      </div>
    </section>
  );
};

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

// 5. Features Section
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

// 6. Main Home Component
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalItem, setCartModalItem] = useState(null);
  const navigate = useNavigate();

  const handleCartAdded = useCallback((item) => {
    setCartModalItem(item);
    setCartModalOpen(true);
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Scroll reveal efekti
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?isFeatured=true');
      // featuredAt'e göre sırala (ilk öne çıkarılan en üstte)
      const sorted = response.data.sort((a, b) => {
        if (a.featuredAt && b.featuredAt) {
          return new Date(a.featuredAt) - new Date(b.featuredAt);
        }
        if (a.featuredAt) return -1;
        if (b.featuredAt) return 1;
        return 0;
      });
      // Her renk için ayrı kart oluştur
      const expanded = sorted.flatMap(product => {
        const colors = product.colors || [];
        if (colors.length <= 1) {
          return [{ product, colorIndex: 0 }];
        }
        return colors.map((_, colorIndex) => ({ product, colorIndex }));
      });
      setFeaturedProducts(expanded.slice(0, 12)); // İlk 12 kartı al
    } catch (error) {
      console.error('Öne çıkan ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

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
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Scroll ile görünür olan elementler */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.15s; }
        .reveal-delay-2 { transition-delay: 0.3s; }
        .reveal-delay-3 { transition-delay: 0.45s; }
      `}</style>

      <Navbar />
      <Hero />

      {/* Hero → Kategoriler arası yumuşak geçiş */}
      <div className="relative">
        <div className="absolute -top-24 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none" />
      </div>

      {/* --- KATEGORİLER (GRID LAYOUT) --- */}
      <section aria-label="Koleksiyon kategorileri" className="py-10 md:py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8 reveal">
             <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter">KOLEKSİYONU <br/> <span className="text-outline text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500" style={{WebkitTextStroke: "1px black"}}>KEŞFET</span></h2>
             <button onClick={() => navigate('/store')} className="hidden md:flex items-center gap-2 text-sm font-bold border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors">TÜMÜNÜ GÖR <ArrowRight className="w-4 h-4"/></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] md:h-[600px]">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.link} className={`relative group overflow-hidden cursor-pointer h-full reveal reveal-delay-${i + 1} ${i === 0 ? 'md:col-span-2' : ''}`}>
              <img src={cat.image} alt={`${cat.name} Ayakkabı Koleksiyonu - PAPUÇGNC`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">{cat.name}</h3>
                <span className="text-sm font-bold underline opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 block mt-2">ŞİMDİ İNCELE</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Kategoriler → Kampanya arası yumuşak geçiş */}
      <div className="h-24 bg-gradient-to-b from-white to-black" />

      {/* --- KAMPANYA BANNERI --- */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left reveal">
                <span className="text-red-500 font-bold tracking-widest text-sm">ÖZEL KAMPANYA</span>
                <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">2. ÇİFT <span className="text-red-500">899 TL</span></h2>
                <p className="text-gray-400 max-w-lg mb-6">Seçili ürünlerde geçerli bu dev fırsatı kaçırma. Arkadaşınla paylaş ya da kendine bir güzellik yap.</p>
                <button onClick={() => navigate('/store')} className="bg-white text-black px-8 py-3 font-bold hover:bg-gray-200 transition-colors">KAMPANYAYA GİT</button>
            </div>
            {/* Kampanya Görseli */}
            <div className="w-full md:w-1/2 h-64 md:h-80 bg-gray-800 relative overflow-hidden rounded-lg reveal reveal-delay-1">
                 <img src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Kampanya" />
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-6 py-4 font-black text-xl rotate-3 shadow-xl whitespace-nowrap">
                    SINIRLI SÜRE!
                 </div>
            </div>
        </div>
      </section>

      {/* Kampanya → Ürünler arası yumuşak geçiş */}
      <div className="h-24 bg-gradient-to-b from-black to-white" />

      {/* --- ÖNE ÇIKAN ÜRÜNLER (Responsive Grid) --- */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12 reveal">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">EN POPÜLER <br/> <span className="text-gray-400">DROP'LAR</span></h2>
            <p className="text-gray-500 mt-2">Müşterilerimizin favori tercihleri.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((item, idx) => (
              <div key={`${item.product._id}-${item.colorIndex}`} className={`reveal reveal-delay-${(idx % 4) + 1}`}>
                <ProductCard product={item.product} colorIndex={item.colorIndex} onCartAdded={handleCartAdded} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Henüz öne çıkan ürün bulunmuyor
          </div>
        )}
        
        <div className="mt-12 text-center reveal">
             <button onClick={() => navigate('/store')} className="border border-black px-10 py-3 font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all">
                TÜM ÜRÜNLERİ GÖR
             </button>
        </div>
      </section>

      {/* --- STATS & TRUST --- */}
      <Features />

      {/* Features → Footer arası yumuşak geçiş */}
      <div className="h-16 bg-gradient-to-b from-white to-gray-900" />

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
                <div className="text-2xl font-black italic mb-6">PAPUÇ<span className="text-red-600">GNC</span>.</div>
                <p className="text-gray-400 text-sm">Sokağın ritmini yakalayan, tarz sahibi gençler için premium ayakkabı deneyimi.</p>
                <div className="flex gap-4 mt-6">
                    {/* Social Icons Placeholder */}
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">IG</div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">TW</div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">TT</div>
                </div>
            </div>
            
            <div>
                <h4 className="font-bold text-lg mb-6">ALIŞVERİŞ</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                    <li><Link to="/store" className="hover:text-white cursor-pointer">Yeni Sezon</Link></li>
                    <li><Link to="/store" className="hover:text-white cursor-pointer">Çok Satanlar</Link></li>
                    <li><Link to="/store" className="hover:text-white cursor-pointer">İndirimler</Link></li>
                    <li><Link to="/store" className="hover:text-white cursor-pointer">Kampanyalar</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-lg mb-6">DESTEK</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                    <li><Link to="#" className="hover:text-white cursor-pointer">Sipariş Takibi</Link></li>
                    <li><Link to="#" className="hover:text-white cursor-pointer">İade ve Değişim</Link></li>
                    <li><Link to="#" className="hover:text-white cursor-pointer">Sıkça Sorulan Sorular</Link></li>
                    <li><Link to="#" className="hover:text-white cursor-pointer">İletişim</Link></li>
                </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
                 <h4 className="font-bold text-lg mb-6">BÜLTEN</h4>
                 <p className="text-gray-400 text-sm mb-4">Özel indirimlerden ve yeni 'drop'lardan ilk senin haberin olsun.</p>
                 <div className="flex">
                    <input type="email" placeholder="E-posta adresi" className="bg-gray-800 text-white px-4 py-3 w-full outline-none focus:ring-1 focus:ring-white text-sm" />
                    <button className="bg-white text-black px-4 font-bold text-sm hover:bg-gray-200">KAYIT</button>
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
