import { Plus, Package } from 'lucide-react';

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
};

const getBrandLogo = (brandName) => {
  return brandLogos[brandName] || brandLogos[brandName?.toLowerCase()] || null;
};

const BrandList = ({ brands, onAddProduct }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {brands.map((brand) => {
        const logo = getBrandLogo(brand.name);
        return (
          <div
            key={brand._id}
            className="relative group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center p-6 h-40">
              {logo ? (
                <div className="w-20 h-20 flex items-center justify-center mb-3">
                  <img
                    src={logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : brand.logoUrl ? (
                <div className="w-20 h-20 flex items-center justify-center mb-3">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
                  <span className="text-2xl font-black text-gray-400">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <p className="text-sm font-bold text-gray-800 tracking-tight">{brand.name}</p>
            </div>
            
            {/* Hover Overlay - Ürün Ekle Butonu */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-6">
              <button
                onClick={() => onAddProduct(brand)}
                className="bg-white text-gray-900 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-all font-bold text-sm shadow-lg translate-y-2 group-hover:translate-y-0 duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Ürün Ekle</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BrandList;
