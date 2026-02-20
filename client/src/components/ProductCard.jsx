import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import getImageUrl from '../utils/imageUrl';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // İlk rengin görsellerini al
  const firstColor = product.colors?.[0];
  const images = firstColor?.images || [];
  const hoverVideo = firstColor?.hoverVideo || '';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverVideo) {
      // Video varsa video oynatılacak
    } else if (images.length > 1) {
      // Video yoksa ikinci resmi göster
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ürün Görseli */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {isHovered && hoverVideo ? (
          <video
            src={hoverVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : images[currentImageIndex] ? (
          <img
            src={getImageUrl(images[currentImageIndex])}
            alt={`${product.name} - ${product.brand?.name || ''} Ayakkabı`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Görsel Yok
          </div>
        )}

        {/* Öne Çıkan Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            Öne Çıkan
          </div>
        )}
      </div>

      {/* Ürün Bilgileri */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price && (
                <p className="text-sm text-gray-400 line-through font-medium">
                  ₺{Math.max(product.price, product.originalPrice).toLocaleString('tr-TR')}
                </p>
              )}
              <p className="text-xl font-bold text-gray-800">
                ₺{(product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price
                  ? Math.min(product.price, product.originalPrice)
                  : product.price
                ).toLocaleString('tr-TR')}
              </p>
            </div>
            <p className="text-xs text-gray-500">{product.category}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {product.colors?.length || 0} Renk
            </p>
            {product.brand?.name && (
              <p className="text-xs text-gray-500">{product.brand.name}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

