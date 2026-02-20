import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, X } from 'lucide-react';
import getImageUrl from '../utils/imageUrl';

const CartAddedModal = ({ isOpen, onClose, item }) => {
  const navigate = useNavigate();

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-modalSlideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başarı göstergesi */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounceIn">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">Sepete Eklendi!</h3>
          <p className="text-sm text-gray-500">Ürün başarıyla sepetinize eklendi.</p>
        </div>

        {/* Ürün bilgisi */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name || 'Ürün'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                  Görsel
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.name || 'Ürün'}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.selectedColor} / Numara: {item.selectedSize}
              </p>
              <p className="text-sm font-black text-gray-900 mt-1">
                ₺{item.price?.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={() => {
              navigate('/cart');
              onClose();
            }}
            className="w-full bg-black text-white py-4 rounded-xl font-black text-sm tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            SEPETE GİT
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-sm tracking-wider hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            ALIŞVERİŞE DEVAM ET
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartAddedModal;


