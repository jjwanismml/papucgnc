import { useEffect, useState } from 'react';
import { Plus, Star, Package, Search, Filter, AlertTriangle, X } from 'lucide-react';
import api from '../../utils/axios';
import getImageUrl from '../../utils/imageUrl';
import BrandList from '../../components/admin/BrandList';
import BrandModal from '../../components/admin/BrandModal';
import ProductModal from '../../components/admin/ProductModal';
import ProductList from '../../components/admin/ProductList';

const Products = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Düzenleme state'leri
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Ürün silme onay state'leri
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Marka silme onay state'leri
  const [brandDeleteTarget, setBrandDeleteTarget] = useState(null);
  const [isBrandDeleteModalOpen, setIsBrandDeleteModalOpen] = useState(false);
  const [isBrandDeleting, setIsBrandDeleting] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

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
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    fetchProducts();
  };

  // Düzenleme
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // Silme
  const handleDeleteProduct = (product) => {
    setDeleteTarget(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${deleteTarget._id}`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (error) {
      console.error('Ürün silme hatası:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleToggleFeature = async (productId) => {
    try {
      await api.put(`/products/${productId}/feature`);
      fetchProducts();
    } catch (error) {
      console.error('Öne çıkarma hatası:', error);
    }
  };

  const handleBrandAdded = () => {
    fetchBrands();
  };

  // Marka Silme
  const handleDeleteBrand = (brand) => {
    setBrandDeleteTarget(brand);
    setIsBrandDeleteModalOpen(true);
  };

  const confirmBrandDelete = async () => {
    if (!brandDeleteTarget) return;
    try {
      setIsBrandDeleting(true);
      await api.delete(`/brands/${brandDeleteTarget._id}`);
      setIsBrandDeleteModalOpen(false);
      setBrandDeleteTarget(null);
      fetchBrands();
      fetchProducts();
    } catch (error) {
      console.error('Marka silme hatası:', error);
    } finally {
      setIsBrandDeleting(false);
    }
  };

  const cancelBrandDelete = () => {
    setIsBrandDeleteModalOpen(false);
    setBrandDeleteTarget(null);
  };

  // Ürün araması
  const filteredProducts = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Ürün Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} ürün, {brands.length} marka</p>
        </div>
      </div>

      {/* Marka Listesi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Markalar</h2>
              <p className="text-xs text-gray-400">Marka seçerek ürün ekleyebilirsiniz</p>
            </div>
          </div>
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm shadow-lg shadow-gray-900/10"
          >
            <Plus className="w-4 h-4" />
            Yeni Marka
          </button>
        </div>
        {brands.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Henüz marka bulunmuyor</p>
            <p className="text-gray-400 text-sm mb-4">İlk markayı ekleyerek başlayın</p>
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm"
            >
              <Plus className="w-5 h-5" />
              İlk Markayı Ekle
            </button>
          </div>
        ) : (
          <BrandList brands={brands} onAddProduct={handleAddProduct} onDeleteBrand={handleDeleteBrand} />
        )}
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
      <div>
              <h2 className="text-lg font-bold text-gray-900">Tüm Ürünler</h2>
              <p className="text-xs text-gray-400">{filteredProducts.length} ürün listeleniyor</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün, marka veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm font-medium">Ürünler yükleniyor...</p>
            </div>
          </div>
        ) : (
          <ProductList
            products={filteredProducts}
            onToggleFeature={handleToggleFeature}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      {/* Marka Ekleme Modalı */}
      {isBrandModalOpen && (
        <BrandModal
          onClose={() => setIsBrandModalOpen(false)}
          onSuccess={handleBrandAdded}
        />
      )}

      {/* Ürün Ekleme Modalı */}
      {isModalOpen && (
        <ProductModal
          brand={selectedBrand}
          onClose={handleCloseModal}
        />
      )}

      {/* Ürün Düzenleme Modalı */}
      {isEditModalOpen && editingProduct && (
        <ProductModal
          editProduct={editingProduct}
          brands={brands}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Silme Onay Modalı */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`
            @keyframes deleteModalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl shadow-black/20 overflow-hidden"
            style={{ animation: 'deleteModalIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center">Ürünü Sil</h3>
              <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                <span className="font-bold text-gray-800">"{deleteTarget.name}"</span> ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>

            {/* Ürün Önizleme */}
            <div className="mx-6 mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              {deleteTarget.colors?.[0]?.images?.[0] ? (
                <img
                  src={getImageUrl(deleteTarget.colors[0].images[0])}
                  alt={deleteTarget.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{deleteTarget.name}</p>
                <p className="text-xs text-gray-500">{deleteTarget.brand?.name} • ₺{deleteTarget.price?.toLocaleString('tr-TR')}</p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="p-6 flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-semibold text-sm transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Siliniyor...
                  </>
                ) : (
                  'Evet, Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Marka Silme Onay Modalı */}
      {isBrandDeleteModalOpen && brandDeleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`
            @keyframes brandDeleteModalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl shadow-black/20 overflow-hidden"
            style={{ animation: 'brandDeleteModalIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center">Markayı Sil</h3>
              <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                <span className="font-bold text-gray-800">"{brandDeleteTarget.name}"</span> markasını silmek istediğinize emin misiniz?
              </p>
              <p className="text-xs text-red-500 text-center mt-2 font-semibold bg-red-50 rounded-lg py-2 px-3">
                ⚠️ Bu markaya ait tüm ürünler de kalıcı olarak silinecektir. Bu işlem geri alınamaz!
              </p>
            </div>

            {/* Marka Önizleme */}
            <div className="mx-6 mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-2">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{brandDeleteTarget.name}</p>
                <p className="text-xs text-gray-500">
                  {products.filter(p => p.brand?._id === brandDeleteTarget._id || p.brand === brandDeleteTarget._id).length} ürün silinecek
                </p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="p-6 flex gap-3">
              <button
                onClick={cancelBrandDelete}
                disabled={isBrandDeleting}
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-semibold text-sm transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmBrandDelete}
                disabled={isBrandDeleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
              >
                {isBrandDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Siliniyor...
                  </>
                ) : (
                  'Evet, Markayı Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
