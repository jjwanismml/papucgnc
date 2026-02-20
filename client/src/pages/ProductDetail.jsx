import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Tag, Minus, Plus, AlertCircle } from 'lucide-react';
import api from '../utils/axios';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import CartAddedModal from '../components/CartAddedModal';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const initialColorIndex = parseInt(searchParams.get('color')) || 0;
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(initialColorIndex);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalItem, setCartModalItem] = useState(null);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
    // URL'den renk parametresini oku
    const colorParam = parseInt(searchParams.get('color'));
    if (!isNaN(colorParam) && colorParam >= 0) {
      setSelectedColorIndex(colorParam);
    } else {
      setSelectedColorIndex(0);
    }
  }, [id, searchParams]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      setSimilarProducts(response.data.similarProducts || []);
    } catch (error) {
      console.error('Ürün detayı yüklenirken hata:', error);
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const selectedColor = product.colors[selectedColorIndex];
  const rawImages = selectedColor?.images || [];
  const images = rawImages.map(img => getImageUrl(img));
  const currentImage = images[selectedImageIndex] || '';

  // Seçilen renk için stok durumuna göre numaraları filtrele
  const availableSizes = selectedColor?.sizes
    .filter((size) => size.stock > 0)
    .map((size) => size.size) || [];

  // Toplam stok
  const totalStock = selectedColor?.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;

  // Fiyat hesaplama - originalPrice ve price arasında hangisi büyükse o çizili gösterilir
  const hasDiscount = product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price;
  const displayPrice = hasDiscount ? Math.min(product.price, product.originalPrice) : product.price;
  const strikethroughPrice = hasDiscount ? Math.max(product.price, product.originalPrice) : null;
  const discountPercent = hasDiscount ? Math.round((1 - displayPrice / strikethroughPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      // Numara seçim alanına scroll
      const sizeSection = document.querySelector('[data-size-section]');
      if (sizeSection) sizeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    addToCart({
      productId: product._id,
      product: product,
      selectedColor: selectedColor.colorName,
      selectedSize: selectedSize,
      quantity: quantity,
      price: displayPrice,
      originalPrice: strikethroughPrice || displayPrice,
      image: images[0] || '',
    });

    // Modal göster
    setCartModalItem({
      name: product.name,
      image: images[0] || '',
      selectedColor: selectedColor.colorName,
      selectedSize: selectedSize,
      price: displayPrice,
    });
    setCartModalOpen(true);
  };

  const handleQuantity = (type) => {
    if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'inc') setQuantity(quantity + 1);
  };

  // Ürün için SEO JSON-LD
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.brand?.name || ''} marka ayakkabı`,
    "image": images.length > 0 ? images : undefined,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || ''
    },
    "offers": {
      "@type": "Offer",
      "url": `https://papucgnc.com/product/${product._id}`,
      "priceCurrency": "TRY",
      "price": displayPrice,
      "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "PAPUÇGNC"
      }
    },
    "category": product.category || "Ayakkabı"
  };

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SEO
        title={`${product.name} - ${product.brand?.name || ''}`}
        description={`${product.name} ${product.brand?.name || ''} marka ayakkabı. ${strikethroughPrice ? `İndirimli fiyat: ₺${displayPrice}` : `Fiyat: ₺${displayPrice}`}. Hızlı kargo, kapıda ödeme seçeneği ile PAPUÇGNC'de.`}
        keywords={`${product.name}, ${product.brand?.name || ''}, ayakkabı, sneakers, ${product.category || ''}`}
        url={`/product/${product._id}`}
        image={images[0] || '/logo.png'}
        type="product"
        jsonLd={productJsonLd}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Ürünlere Dön */}
        <button
          onClick={() => navigate('/store')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Mağazaya Dön
        </button>

        {/* Ürün Detayı */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
          
          {/* Sol Taraf - Görseller */}
          <div>
            {/* Büyük Görsel */}
            <div className="relative mb-3 bg-gray-50 rounded-xl overflow-hidden aspect-square">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={`${product.name} - ${product.brand?.name || ''} Ayakkabı Görseli`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Görsel Yok
                </div>
              )}
              {/* Görsel sayacı */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Küçük Galeri */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === index
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Görsel ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Taraf - Ürün Bilgileri */}
          <div className="flex flex-col">

            {/* Kategori Badge */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4 w-fit border border-red-100">
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </span>
            )}

            {/* Ürün Adı */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              {product.name}
            </h1>

            {/* Fiyat */}
            <div className="flex items-baseline gap-3 mb-2">
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  ₺{strikethroughPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              )}
              <span className="text-4xl font-black text-gray-900">
                ₺{displayPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
              {hasDiscount && discountPercent > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  %{discountPercent} İNDİRİM
                </span>
              )}
            </div>

            {/* Stok Durumu */}
            {totalStock > 0 && totalStock <= 10 && (
              <div className="mb-1">
                <span className="text-red-500 font-bold text-sm flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Sınırlı stokta mevcuttur
                </span>
                <p className="text-gray-500 text-sm mt-0.5">Stoklar tükenmeden acele edin!</p>
              </div>
            )}

            {/* Açıklama */}
            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed mt-2 mb-6">{product.description}</p>
            )}

            {/* Renk Seçenekleri - Görsel Thumbnail'lar */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                Renk Seçenekleri
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, index) => {
                  const colorImage = color.images?.[0] ? getImageUrl(color.images[0]) : '';
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedColorIndex(index);
                        setSelectedImageIndex(0);
                        setSelectedSize(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all w-[80px] ${
                        selectedColorIndex === index
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {colorImage ? (
                        <img
                          src={colorImage}
                          alt={color.colorName}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-md border border-gray-200"
                          style={{ backgroundColor: color.hexCode || '#ccc' }}
                        />
                      )}
                      <span className="text-[11px] font-semibold text-gray-600 truncate w-full text-center">
                        {color.colorName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numara Seçimi */}
            <div className="mb-6" data-size-section>
              <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                Numara Seçin <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 9 }, (_, i) => {
                  const size = 36 + i;
                  const isAvailable = availableSizes.includes(size);
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`w-12 h-12 rounded-lg border-2 font-bold text-sm transition-all ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : isAvailable
                          ? 'border-gray-200 hover:border-black text-gray-700'
                          : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {selectedColor && availableSizes.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Seçilen renk için mevcut numaralar: {availableSizes.join(', ')}
                </p>
              )}
            </div>

            {/* Miktar */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                Miktar
              </label>
              <div className="inline-flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantity('dec')}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-11 flex items-center justify-center font-bold text-lg border-x-2 border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantity('inc')}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sepete Ekle Butonu */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-base tracking-widest uppercase transition-all ${
                selectedSize
                  ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              SEPETE EKLE
            </button>

            {/* Ürün Detay Bilgileri */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Marka</span>
                  <span className="font-bold text-gray-800">{product.brand?.name || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Kategori</span>
                  <span className="font-bold text-gray-800">{product.category}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Renk Seçenekleri</span>
                  <span className="font-bold text-gray-800">{product.colors.length} renk</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Stok</span>
                  <span className={`font-bold ${totalStock > 10 ? 'text-green-600' : totalStock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {totalStock > 10 ? 'Stokta' : totalStock > 0 ? `Son ${totalStock} adet` : 'Tükendi'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benzer Ürünler */}
        {similarProducts.length > 0 && (
          <div className="mt-8 pt-12 border-t border-gray-100">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight">
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct._id} product={similarProduct} />
              ))}
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

export default ProductDetail;
