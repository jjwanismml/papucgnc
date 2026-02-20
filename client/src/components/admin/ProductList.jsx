import { Star, Eye, Palette, Box, Edit3, Trash2 } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';

// Marka logoları
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

const ProductList = ({ products, onToggleFeature, onEdit, onDelete }) => {
  // Toplam stok hesapla
  const getTotalStock = (product) => {
    return product.colors?.reduce((total, color) => {
      return total + color.sizes?.reduce((sum, size) => sum + size.stock, 0);
    }, 0) || 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map((product) => {
        const totalStock = getTotalStock(product);
        const brandLogo = getBrandLogo(product.brand?.name);

        return (
          <div
            key={product._id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
          >
            {/* Ürün Görseli */}
            <div className="relative h-52 bg-gray-50 overflow-hidden">
              {product.colors[0]?.images[0] ? (
                <img
                  src={getImageUrl(product.colors[0].images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Box className="w-12 h-12 text-gray-300" />
                </div>
              )}

              {/* Featured Badge */}
              {product.isFeatured && (
                <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  Öne Çıkan
                </div>
              )}

              {/* Stock Badge */}
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md ${
                totalStock > 10 
                  ? 'bg-emerald-500/90 text-white' 
                  : totalStock > 0 
                    ? 'bg-amber-500/90 text-white' 
                    : 'bg-red-500/90 text-white'
              }`}>
                {totalStock > 0 ? `${totalStock} Stok` : 'Tükendi'}
              </div>

              {/* Brand Logo Overlay */}
              {brandLogo && (
                <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
                  <img src={brandLogo} alt={product.brand?.name} className="w-full h-full object-contain" />
                </div>
              )}

              {/* Color Previews */}
              {product.colors?.length > 1 && (
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {product.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.hexCode }}
                      title={color.colorName}
                    />
                  ))}
                  {product.colors.length > 5 && (
                    <div className="w-5 h-5 rounded-full bg-black/60 border-2 border-white text-white text-[8px] font-bold flex items-center justify-center">
                      +{product.colors.length - 5}
                    </div>
                  )}
                </div>
              )}

              {/* Hover Overlay - Düzenle/Sil Butonları */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    className="p-3 bg-white rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-110"
                    title="Düzenle"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                    className="p-3 bg-white rounded-xl text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:scale-110"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{product.brand?.name || 'Marka Yok'}</p>
                </div>
                <button
                  onClick={() => onToggleFeature(product._id)}
                  className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    product.isFeatured
                      ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 shadow-sm'
                      : 'bg-gray-50 text-gray-300 hover:bg-amber-50 hover:text-amber-400'
                  }`}
                  title={product.isFeatured ? 'Öne çıkarılmış - Kaldır' : 'Öne çıkar'}
                >
                  <Star
                    className={`w-[18px] h-[18px] ${
                      product.isFeatured ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  {product.originalPrice && product.originalPrice > 0 && product.originalPrice !== product.price ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400 line-through font-medium">
                        ₺{Math.max(product.price, product.originalPrice).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-xl font-black text-red-600 tracking-tight">
                        ₺{Math.min(product.price, product.originalPrice).toLocaleString('tr-TR')}
                      </p>
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        %{Math.round((1 - Math.min(product.price, product.originalPrice) / Math.max(product.price, product.originalPrice)) * 100)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-black text-gray-900 tracking-tight">
                      ₺{product.price.toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1" title="Renk sayısı">
                    <Palette className="w-3.5 h-3.5" />
                    <span className="font-semibold">{product.colors?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Kategori">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md font-semibold text-gray-500">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="col-span-full text-center py-16">
          <Box className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Henüz ürün bulunmuyor</p>
          <p className="text-gray-300 text-sm mt-1">Marka seçip ilk ürünü ekleyin</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
