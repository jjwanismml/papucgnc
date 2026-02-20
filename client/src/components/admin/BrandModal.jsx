import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import api from '../../utils/axios';

const BrandModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Marka adı gereklidir';
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
      await api.post('/brands', {
        name: formData.name.trim(),
        logoUrl: '',
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Marka ekleme hatası:', error);
      setErrors({
        submit: error.response?.data?.error || 'Marka eklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl shadow-black/20 overflow-hidden animate-in"
        style={{ animation: 'modalIn 0.3s ease-out' }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Yeni Marka</h2>
                <p className="text-xs text-gray-400 mt-0.5">Yeni bir marka oluşturun</p>
              </div>
            </div>
          <button
            onClick={onClose}
            disabled={loading}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
              <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Marka Adı */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Marka Adı
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Örn: Nike, Adidas, Puma"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium ${
                errors.name 
                  ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                  : 'border-gray-200 focus:border-gray-900 bg-gray-50 focus:bg-white'
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Hata Mesajı */}
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Başarı Mesajı */}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <p className="text-sm font-medium">Marka başarıyla eklendi!</p>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-900/10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Başarılı!
                </>
              ) : (
                'Markayı Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;
