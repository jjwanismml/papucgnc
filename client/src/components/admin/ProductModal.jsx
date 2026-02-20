import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Package, Image, Palette, Film, Edit3, Upload, Loader2 } from 'lucide-react';
import api from '../../utils/axios';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://papucgnc-production.up.railway.app';

const ProductModal = ({ brand, onClose, editProduct, brands }) => {
  const isEditMode = !!editProduct;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: brand?._id || '',
    colors: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null); // hangi renk için yükleniyor
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const fileInputRefs = useRef({});
  const uploadInProgress = useRef(false);

  // Edit modunda mevcut ürünün verilerini doldur
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: editProduct.price?.toString() || '',
        originalPrice: editProduct.originalPrice?.toString() || '',
        category: editProduct.category || '',
        brand: editProduct.brand?._id || editProduct.brand || '',
        colors: editProduct.colors?.map(color => ({
          colorName: color.colorName || '',
          hexCode: color.hexCode || '#000000',
          images: [...(color.images || [])],
          hoverVideo: color.hoverVideo || '',
          sizes: color.sizes?.length > 0
            ? color.sizes.map(s => ({ size: s.size, stock: s.stock }))
            : Array.from({ length: 9 }, (_, i) => ({ size: 36 + i, stock: 0 })),
        })) || [],
      });
    }
  }, [editProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          colorName: '',
          hexCode: '#000000',
          images: [],
          hoverVideo: '',
          sizes: Array.from({ length: 9 }, (_, i) => ({
            size: 36 + i,
            stock: 0,
          })),
        },
      ],
    }));
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleColorChange = (index, field, value) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], [field]: value };
      return { ...prev, colors: newColors };
    });
  };

  // Dosya yükleme - birden fazla resim
  const handleFileUpload = async (colorIndex, files) => {
    if (!files || files.length === 0) return;
    
    // Çift tetiklenmeyi engelle
    if (uploadInProgress.current) return;
    uploadInProgress.current = true;

    setUploadingFor(colorIndex);
    setErrors((prev) => {
      const n = { ...prev };
      delete n[`image_${colorIndex}`];
      delete n[`color_${colorIndex}_images`];
      return n;
    });

    try {
      const formDataUpload = new FormData();
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('images', files[i]);
      }

      const response = await axios.post(`${API_BASE}/api/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = response.data.urls;

      setFormData((prev) => {
        const newColors = [...prev.colors];
        // Tekrar eklemeyi önle
        const existingImages = new Set(newColors[colorIndex].images);
        const newImages = uploadedUrls.filter(url => !existingImages.has(url));
        newColors[colorIndex].images = [
          ...newColors[colorIndex].images,
          ...newImages,
        ];
        return { ...prev, colors: newColors };
      });
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setErrors((prev) => ({
        ...prev,
        [`image_${colorIndex}`]: error.response?.data?.error || 'Resim yüklenirken hata oluştu',
      }));
    } finally {
      setUploadingFor(null);
      uploadInProgress.current = false;
      // File input'u sıfırla
      const inputKey = `${colorIndex}_file`;
      if (fileInputRefs.current[inputKey]) {
        fileInputRefs.current[inputKey].value = '';
      }
    }
  };

  const handleImageRemove = (colorIndex, imageIndex) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[colorIndex].images = newColors[colorIndex].images.filter(
        (_, i) => i !== imageIndex
      );
      return { ...prev, colors: newColors };
    });
  };

  const handleSizeStockChange = (colorIndex, sizeIndex, stock) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[colorIndex].sizes[sizeIndex].stock = parseInt(stock) || 0;
      return { ...prev, colors: newColors };
    });
  };

  // Resim URL'sini tam hale getir (sunucu yolu ise base URL ekle)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Ürün adı gereklidir';
    if (!formData.description.trim()) newErrors.description = 'Açıklama gereklidir';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Geçerli bir fiyat girin';
    if (!formData.category.trim()) newErrors.category = 'Kategori gereklidir';
    if (!formData.brand) newErrors.brand = 'Marka seçilmelidir';

    if (formData.colors.length === 0) {
      newErrors.colors = 'En az bir renk varyasyonu eklemelisiniz';
    } else {
      formData.colors.forEach((color, index) => {
        if (!color.colorName.trim()) newErrors[`color_${index}_name`] = 'Renk adı gereklidir';
        if (!color.hexCode || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.hexCode)) {
          newErrors[`color_${index}_hex`] = 'Geçerli bir hex renk kodu girin';
        }
        if (color.images.length === 0) newErrors[`color_${index}_images`] = 'En az bir görsel eklemelisiniz';
        const hasStock = color.sizes.some((size) => size.stock > 0);
        if (!hasStock) newErrors[`color_${index}_stock`] = 'En az bir numara için stok girmelisiniz';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category.trim(),
        brand: formData.brand,
        colors: formData.colors.map((color) => ({
          colorName: color.colorName.trim(),
          hexCode: color.hexCode,
          images: color.images.filter((img) => img.trim()),
          hoverVideo: color.hoverVideo.trim() || '',
          sizes: color.sizes,
        })),
      };

      if (isEditMode) {
        await api.put(`/products/${editProduct._id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      
      setSuccess(true);
      setTimeout(() => { onClose(); }, 1500);
    } catch (error) {
      console.error(isEditMode ? 'Ürün güncelleme hatası:' : 'Ürün ekleme hatası:', error);
      setErrors({
        submit: error.response?.data?.error || (isEditMode ? 'Ürün güncellenirken bir hata oluştu' : 'Ürün eklenirken bir hata oluştu'),
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (errorKey) => `w-full px-4 py-3 border-2 rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium ${
    errors[errorKey] 
      ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
      : 'border-gray-200 focus:border-gray-900 bg-gray-50 focus:bg-white'
  }`;

  // Düzenleme modunda marka adını bul
  const getBrandName = () => {
    if (brand?.name) return brand.name;
    if (editProduct?.brand?.name) return editProduct.brand.name;
    if (brands && formData.brand) {
      const found = brands.find(b => b._id === formData.brand);
      return found?.name || '';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/20"
        style={{ animation: 'modalIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${
              isEditMode 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'
            }`}>
              {isEditMode ? <Edit3 className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {isEditMode ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditMode ? `${editProduct.name}` : `${getBrandName()} markası için`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ürün Adı *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                  placeholder="Örn: Air Max 90"
                  className={inputClass('name')}
              />
              {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fiyat (₺) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                  placeholder="0.00"
                  className={inputClass('price')}
              />
              {errors.price && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.price}
                </p>
              )}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  İndirim / Çizili Fiyat (₺) <span className="text-gray-400 normal-case font-normal">— Opsiyonel</span>
                </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                  placeholder="İndirimli veya eski fiyat"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium bg-gray-50 focus:bg-white focus:border-gray-900"
              />
              <p className="text-gray-400 text-[10px] mt-1.5 font-medium">
                Bu alana ikinci bir fiyat girin. Yüksek olan çizili, düşük olan satış fiyatı olarak gösterilir. (Hangisini nereye girdiğiniz fark etmez, sistem otomatik ayarlar)
              </p>
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Açıklama *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                  placeholder="Ürün açıklaması..."
                  className={inputClass('description')}
              />
              {errors.description && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kampanya/Kategori *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Örn: Yeni Sezon, İndirim, Spor"
                  className={inputClass('category')}
              />
              {errors.category && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.category}
                  </p>
                )}
              </div>
              {/* Marka seçici */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Marka *</label>
                {isEditMode && brands ? (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={inputClass('brand')}
                  >
                    <option value="">Marka Seçin</option>
                    {brands.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={getBrandName()}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-sm font-medium text-gray-500 cursor-not-allowed"
                  />
                )}
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.brand}
                </p>
              )}
              </div>
            </div>
          </div>

          {/* Renk Varyasyonları */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Renk Varyasyonları *
              </h3>
              <button
                type="button"
                onClick={handleAddColor}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Renk Ekle
              </button>
            </div>
            {errors.colors && (
              <p className="text-red-500 text-xs mb-3 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.colors}
              </p>
            )}

            {formData.colors.map((color, colorIndex) => (
              <div
                key={colorIndex}
                className="border-2 border-gray-100 rounded-2xl p-5 mb-4 hover:border-gray-200 transition-colors"
              >
                {/* Color Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-inner"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <h4 className="font-bold text-gray-800 text-sm">
                      Renk {colorIndex + 1} {color.colorName && `- ${color.colorName}`}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(colorIndex)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Color Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Renk Adı *</label>
                    <input
                      type="text"
                      value={color.colorName}
                      onChange={(e) => {
                        handleColorChange(colorIndex, 'colorName', e.target.value);
                        setErrors((prev) => { const n = { ...prev }; delete n[`color_${colorIndex}_name`]; return n; });
                      }}
                      placeholder="Örn: Kırmızı"
                      className={inputClass(`color_${colorIndex}_name`)}
                    />
                    {errors[`color_${colorIndex}_name`] && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors[`color_${colorIndex}_name`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hex Kodu *</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color.hexCode}
                        onChange={(e) => {
                          handleColorChange(colorIndex, 'hexCode', e.target.value);
                          setErrors((prev) => { const n = { ...prev }; delete n[`color_${colorIndex}_hex`]; return n; });
                        }}
                        className="w-14 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color.hexCode}
                        onChange={(e) => {
                          handleColorChange(colorIndex, 'hexCode', e.target.value);
                          setErrors((prev) => { const n = { ...prev }; delete n[`color_${colorIndex}_hex`]; return n; });
                        }}
                        placeholder="#FF0000"
                        className={`flex-1 ${inputClass(`color_${colorIndex}_hex`)}`}
                      />
                    </div>
                    {errors[`color_${colorIndex}_hex`] && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors[`color_${colorIndex}_hex`]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resim Yükleme */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    Ürün Görselleri *
                  </label>
                  {errors[`color_${colorIndex}_images`] && (
                    <p className="text-red-500 text-xs mb-2 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors[`color_${colorIndex}_images`]}
                    </p>
                  )}
                  <div className="space-y-3">
                    {/* Image Previews */}
                    {color.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {color.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                            <img
                              src={getImageUrl(image)}
                              alt={`Preview ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f3f4f6" width="80" height="80"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10">Hata</text></svg>'; }}
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(colorIndex, imgIndex)}
                              className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                            <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                              {imgIndex + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dosya Yükleme Alanı */}
                    <input
                      type="file"
                      ref={(el) => {
                        const key = `${colorIndex}_file`;
                        if (el) fileInputRefs.current[key] = el;
                      }}
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                      multiple
                      onChange={(e) => handleFileUpload(colorIndex, e.target.files)}
                      className="hidden"
                      id={`file-input-${colorIndex}`}
                    />
                    <label
                      htmlFor={`file-input-${colorIndex}`}
                      className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploadingFor === colorIndex
                          ? 'border-blue-300 bg-blue-50/50'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {uploadingFor === colorIndex ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                          <span className="text-sm font-semibold text-blue-600">Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-sm font-semibold text-gray-500">Resim Yükle</span>
                          <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP • Birden fazla seçilebilir • Max 10MB</span>
                        </>
                      )}
                    </label>

                    {errors[`image_${colorIndex}`] && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors[`image_${colorIndex}`]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Video URL */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    Hover Video URL (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={color.hoverVideo}
                    onChange={(e) => handleColorChange(colorIndex, 'hoverVideo', e.target.value)}
                    placeholder="Video URL'si"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-colors text-sm font-medium bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Stok Matrisi */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Stok Matrisi (36-44) *
                  </label>
                  {errors[`color_${colorIndex}_stock`] && (
                    <p className="text-red-500 text-xs mb-2 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors[`color_${colorIndex}_stock`]}
                    </p>
                  )}
                  <div className="grid grid-cols-9 gap-2">
                    {color.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex}>
                        <label className="block text-[10px] text-gray-400 mb-1.5 text-center font-bold">
                          {size.size}
                        </label>
                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) => {
                            handleSizeStockChange(colorIndex, sizeIndex, e.target.value);
                            setErrors((prev) => { const n = { ...prev }; delete n[`color_${colorIndex}_stock`]; return n; });
                          }}
                          min="0"
                          className={`w-full px-2 py-2.5 border-2 rounded-xl text-center text-sm font-semibold outline-none transition-colors ${
                            size.stock > 0
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400'
                              : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400 font-medium">
                      Toplam Stok: <span className="font-bold text-gray-600">{color.sizes.reduce((sum, size) => sum + size.stock, 0)} adet</span>
                  </p>
                  </div>
                </div>
              </div>
            ))}

            {formData.colors.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <Palette className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">En az bir renk varyasyonu eklemelisiniz</p>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="mt-3 text-sm font-bold text-gray-900 hover:underline"
                >
                  + İlk rengi ekle
                </button>
              </div>
            )}
          </div>

          {/* Hata Mesajı */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Başarı Mesajı */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <p className="text-sm font-medium">
                {isEditMode ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!'}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-4 border-t border-gray-100 -mx-6 px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || success || uploadingFor !== null}
              className={`flex-[2] px-6 py-3.5 text-white rounded-xl disabled:opacity-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg ${
                isEditMode
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
                  : 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/10'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Başarılı!
                </>
              ) : (
                isEditMode ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
