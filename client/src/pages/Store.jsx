import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Filter, ChevronDown, X, SlidersHorizontal, ShoppingBag, Search, Heart } from 'lucide-react';
import api from '../utils/axios';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Layout/Navbar';
import CartAddedModal from '../components/CartAddedModal';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';
import LazyImage from '../components/LazyImage';

// 1-2. Marquee + Navbar artık Navbar bileşeninde birleşik (Shared component)

// Product Card Component (Store için özel - her renk için ayrı kart)
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

  // Tüm renk hex kodlarını al (renk noktaları için)
  const colorHexes = product.colors?.map(color => color.hexCode || '#ffffff') || ['#ffffff'];

  // Bu renk için mevcut numaraları al
  const availableSizes = currentColor?.sizes?.filter(s => s.stock > 0).map(s => s.size) || [];

  // Fiyat hesaplama - originalPrice ve price arasında hangisi büyükse o çizili gösterilir
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

    // Numara seçimi zorunlu - seçilmediyse size selector aç
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
        
        {/* Quick Add Button - Mobile: Always visible, Desktop: Hover */}
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

// Marka isimlerini logo dosyalarına eşle
const brandLogos = {
  'Nike': '/nike.webp',
  'nike': '/nike.webp',
  'Adidas': '/adidas.webp',
  'adidas': '/adidas.webp',
  'Vans': '/vans.webp',
  'vans': '/vans.webp',
  'Puma': '/puma.webp',
  'puma': '/puma.webp',
  'Calvin Klein': '/calvin-klein .webp',
  'calvin klein': '/calvin-klein .webp',
  'CalvinKlein': '/calvin-klein .webp',
  'Lacoste': '/lacoste.webp',
  'lacoste': '/lacoste.webp',
  'New Balance': '/new-balance.webp',
  'new balance': '/new-balance.webp',
  'NewBalance': '/new-balance.webp',
  'Converse': '/converse.webp',
  'converse': '/converse.webp',
};

const getBrandLogo = (brandName) => {
  return brandLogos[brandName] || brandLogos[brandName?.toLowerCase()] || null;
};

const Store = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState("Tümü");
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('default');
  
  // Sepete ekleme modal state
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalItem, setCartModalItem] = useState(null);

  const handleCartAdded = useCallback((item) => {
    setCartModalItem(item);
    setCartModalOpen(true);
  }, []);

  const sizes = Array.from({ length: 9 }, (_, i) => 36 + i);

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeBrand, selectedSize, priceRange, sortBy]);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeBrand !== "Tümü") {
        const brand = brands.find(b => b.name === activeBrand || b._id === activeBrand);
        if (brand) params.brand = brand._id;
      }
      
      const response = await api.get('/products', { params });
      let filteredProducts = response.data;

      // Numara filtresi (frontend'de)
      if (selectedSize) {
        const sizeNum = parseInt(selectedSize);
        filteredProducts = filteredProducts.filter((product) => {
          return product.colors?.some((color) =>
            color.sizes?.some((size) => size.size === sizeNum && size.stock > 0)
          );
        });
      }

      // Fiyat filtresi
      if (priceRange.min) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(priceRange.max));
      }

      // Sıralama - Öne çıkan ürünler her zaman en üstte
      if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return new Date(a.featuredAt) - new Date(b.featuredAt);
          }
          return a.price - b.price;
        });
      } else if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return new Date(a.featuredAt) - new Date(b.featuredAt);
          }
          return b.price - a.price;
        });
      } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return new Date(a.featuredAt) - new Date(b.featuredAt);
          }
          return a.name.localeCompare(b.name);
        });
      } else {
        // Varsayılan sıralama: öne çıkanlar önce (featuredAt'e göre), sonra diğerleri
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isFeatured && b.isFeatured) {
            return new Date(a.featuredAt) - new Date(b.featuredAt);
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (brand) => {
    setActiveBrand(brand);
    if (mobileFilterOpen) {
      setMobileFilterOpen(false);
    }
  };

  const handleSizeClick = (size) => {
    setSelectedSize(selectedSize === size ? null : size);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setActiveBrand("Tümü");
    setSelectedSize(null);
    setPriceRange({ min: '', max: '' });
  };

  const filteredProducts = products;

  // Her renk için ayrı kart oluştur - ürünleri renklere göre genişlet
  const expandedProducts = filteredProducts.flatMap(product => {
    const colors = product.colors || [];
    if (colors.length <= 1) {
      // Tek renk veya renk yoksa normal göster
      return [{ product, colorIndex: 0 }];
    }
    // Birden fazla renk varsa her renk için ayrı kart
    return colors.map((_, colorIndex) => ({ product, colorIndex }));
  });

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Mağaza - Tüm Ürünler"
        description="PAPUÇGNC mağazasında Nike, Adidas, Vans, Puma, New Balance, Lacoste ve daha fazla markanın ayakkabı modellerini keşfedin. Filtrele, karşılaştır, hemen sipariş ver."
        keywords="ayakkabı mağazası, sneakers, spor ayakkabı, nike ayakkabı, adidas ayakkabı, vans, puma, online alışveriş"
        url="/store"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "PAPUÇGNC Mağaza",
          "description": "Tüm ayakkabı modelleri",
          "url": "https://papucgnc.com/store"
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>

      <Navbar />
      
      <div className="pt-28">

      {/* Header */}
      <div className="bg-gray-100 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 uppercase">Koleksiyon</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">Sokağın en taze parçaları, en yeni drop'lar ve zamansız klasikler tek bir yerde.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 pb-20">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 space-y-8 flex-shrink-0 sticky top-28 h-fit">
            
            {/* Brands - Logo Grid */}
            <div>
                <h3 className="font-black text-lg mb-4 flex items-center justify-between">MARKA <ChevronDown className="w-4 h-4"/></h3>
                <div className="grid grid-cols-3 gap-2">
                    {/* Tümü butonu */}
                    <div 
                      onClick={() => handleBrandChange("Tümü")} 
                      className={`cursor-pointer flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                        activeBrand === "Tümü" 
                          ? "border-black bg-black text-white" 
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-[10px] font-black tracking-wider">TÜMÜ</span>
                    </div>
                    {/* Marka logoları */}
                    {brands.map(brand => {
                      const logo = getBrandLogo(brand.name);
                      return (
                        <div 
                          key={brand._id} 
                          onClick={() => handleBrandChange(brand.name)} 
                          className={`cursor-pointer flex items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 aspect-square ${
                            activeBrand === brand.name 
                              ? "border-black bg-white shadow-md scale-105" 
                              : "border-gray-200 bg-gray-50 hover:border-gray-400 hover:shadow-sm"
                          }`}
                        >
                          {logo ? (
                            <img 
                              src={logo} 
                              alt={brand.name} 
                              className={`w-full h-full object-contain p-1 transition-all duration-200 ${
                                activeBrand === brand.name ? "opacity-100" : "opacity-60 hover:opacity-100"
                              }`}
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-center leading-tight">{brand.name}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
            </div>

            {/* Price */}
            <div>
                <h3 className="font-black text-lg mb-4 flex items-center justify-between">FİYAT <ChevronDown className="w-4 h-4"/></h3>
                <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full bg-gray-100 p-2 text-sm font-bold outline-none border border-transparent focus:border-black" 
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full bg-gray-100 p-2 text-sm font-bold outline-none border border-transparent focus:border-black" 
                    />
                </div>
            </div>

            {/* Sizes */}
            <div>
                <h3 className="font-black text-lg mb-4 flex items-center justify-between">NUMARA <ChevronDown className="w-4 h-4"/></h3>
                <div className="grid grid-cols-4 gap-2">
                    {sizes.map(size => (
                        <div 
                          key={size} 
                          onClick={() => handleSizeClick(size)}
                          className={`cursor-pointer text-xs font-bold py-2 flex items-center justify-center transition-colors ${
                            selectedSize === size 
                              ? 'bg-black text-white' 
                              : 'bg-gray-100 hover:bg-black hover:text-white'
                          }`}
                        >
                            {size}
                        </div>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {(activeBrand !== "Tümü" || selectedSize || priceRange.min || priceRange.max) && (
              <button 
                onClick={clearFilters}
                className="w-full bg-gray-100 text-black py-3 font-bold text-sm hover:bg-black hover:text-white transition-colors"
              >
                FİLTRELERİ TEMİZLE
              </button>
            )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <span className="font-bold text-gray-500 text-sm">{expandedProducts.length} Ürün Listelendi</span>
                <div className="hidden md:flex items-center gap-2 cursor-pointer group relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="font-bold text-sm bg-transparent border-none outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="default">Önerilen Sıralama</option>
                      <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                      <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                      <option value="name">İsme Göre (A-Z)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-0 pointer-events-none group-hover:rotate-180 transition-transform"/>
                </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            ) : expandedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                  {expandedProducts.map(({ product, colorIndex }) => (
                    <ProductCard key={`${product._id}-${colorIndex}`} product={product} colorIndex={colorIndex} onCartAdded={handleCartAdded} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Filtre kriterlerinize uygun ürün bulunamadı
              </div>
            )}
        </main>
      </div>

      {/* Mobile Sticky Filter Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:hidden flex justify-between gap-4 z-40">
        <button 
          onClick={() => setMobileFilterOpen(true)} 
          className="flex-1 bg-gray-100 py-3 font-bold text-sm flex items-center justify-center gap-2"
        >
            <Filter className="w-4 h-4"/> FİLTRELE
        </button>
        <button 
          onClick={() => {
            // Sıralama modalı için (şimdilik sadece filtre modalı)
            setMobileFilterOpen(true);
          }}
          className="flex-1 bg-black text-white py-3 font-bold text-sm flex items-center justify-center gap-2"
        >
            <SlidersHorizontal className="w-4 h-4"/> SIRALA
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
          <div className="fixed inset-0 bg-white z-[60] overflow-y-auto animate-fadeInUp">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                  <h2 className="text-xl font-black italic">FİLTRELER</h2>
                  <button onClick={() => setMobileFilterOpen(false)}><X className="w-6 h-6"/></button>
              </div>
              <div className="p-6 space-y-8">
                  {/* Brands - Logo Grid (Mobile) */}
                  <div>
                      <h3 className="font-black text-lg mb-4">MARKA</h3>
                      <div className="grid grid-cols-3 gap-3">
                          {/* Tümü butonu */}
                          <div 
                            onClick={() => handleBrandChange("Tümü")} 
                            className={`cursor-pointer flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 aspect-square ${
                              activeBrand === "Tümü" 
                                ? "border-black bg-black text-white" 
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            <span className="text-xs font-black tracking-wider">TÜMÜ</span>
                          </div>
                          {/* Marka logoları */}
                          {brands.map(brand => {
                            const logo = getBrandLogo(brand.name);
                            return (
                              <div 
                                key={brand._id} 
                                onClick={() => handleBrandChange(brand.name)} 
                                className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 aspect-square ${
                                  activeBrand === brand.name 
                                    ? "border-black bg-white shadow-lg scale-105" 
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                {logo ? (
                                  <img 
                                    src={logo} 
                                    alt={brand.name} 
                                    className={`w-full h-full object-contain p-1 transition-opacity duration-200 ${
                                      activeBrand === brand.name ? "opacity-100" : "opacity-50"
                                    }`}
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-center leading-tight">{brand.name}</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                  </div>

                  {/* Price */}
                  <div>
                      <h3 className="font-black text-lg mb-4">FİYAT</h3>
                      <div className="flex gap-2">
                          <input 
                            type="number" 
                            placeholder="Min" 
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                            className="w-full bg-gray-100 p-3 font-bold text-sm outline-none border border-transparent focus:border-black" 
                          />
                          <input 
                            type="number" 
                            placeholder="Max" 
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                            className="w-full bg-gray-100 p-3 font-bold text-sm outline-none border border-transparent focus:border-black" 
                          />
                      </div>
                  </div>

                  {/* Sizes */}
                  <div>
                      <h3 className="font-black text-lg mb-4">NUMARA</h3>
                      <div className="grid grid-cols-4 gap-3">
                          {sizes.map(size => (
                              <div 
                                key={size} 
                                onClick={() => handleSizeClick(size)}
                                className={`py-3 font-bold text-center cursor-pointer transition-colors ${
                                  selectedSize === size 
                                    ? 'bg-black text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {size}
                              </div>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={() => setMobileFilterOpen(false)} 
                    className="w-full bg-black text-white py-4 font-black tracking-widest sticky bottom-4"
                  >
                    UYGULA ({expandedProducts.length})
                  </button>
              </div>
          </div>
      )}
      </div>

      {/* Sepete Ekleme Modalı */}
      <CartAddedModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        item={cartModalItem}
      />
    </div>
  );
};

export default Store;
