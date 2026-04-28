import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Copy, Check, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Layout/Navbar';
import SEO from '../components/SEO';
import getImageUrl from '../utils/imageUrl';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  useEffect(() => {
    // İçerik animasyonu için gecikme
    const timer = setTimeout(() => setShowContent(true), 600);
    // Konfeti animasyonunu kaldır
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  // 5 saniye geri sayım ve ana sayfaya yönlendirme
  useEffect(() => {
    if (!order) return;
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-28 flex flex-col items-center justify-center px-4 py-20">
          <p className="text-gray-600 mb-4">Sipariş bilgisi bulunamadı.</p>
          <Link to="/store" className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
            Mağazaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentLabel = {
    'kapida-nakit': 'Kapıda Nakit Ödeme',
    'kapida-kredikarti': 'Kapıda Kredi Kartı',
    'havale-eft': 'Havale/EFT',
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <SEO title="Sipariş Başarılı" description="Siparişiniz başarıyla oluşturuldu." url="/order-success" noindex={true} />
      <Navbar />

      {/* Konfeti Animasyonu */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'][Math.floor(Math.random() * 7)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="pt-28 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Başarı Kartı */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center mb-6 transition-all duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Animasyonlu Başarı İkonu */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Dış ring pulse */}
              <div className="absolute inset-0 bg-green-100 rounded-full animate-order-success-ring" />
              {/* İç ring */}
              <div className="absolute inset-2 bg-green-50 rounded-full animate-order-success-ring-delay" />
              {/* İkon */}
              <div className="absolute inset-0 flex items-center justify-center animate-order-success-check">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black text-gray-900 mb-2 transition-all duration-500 delay-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Siparişiniz Alındı!
            </h1>
            <p className={`text-gray-500 text-sm mb-6 transition-all duration-500 delay-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Siparişiniz başarıyla oluşturuldu. Teşekkür ederiz.
            </p>

            {/* Sipariş Numarası */}
            <div className={`bg-gray-50 rounded-xl p-4 inline-flex items-center gap-3 mb-6 transition-all duration-500 delay-700 ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              <div>
                <p className="text-xs text-gray-500">Sipariş Numarası</p>
                <p className="text-lg font-black text-gray-900">{order.orderNumber}</p>
              </div>
              <button
                onClick={handleCopyOrderNumber}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>

            {/* Bilgi Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8 transition-all duration-500 delay-[900ms] ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ödeme Yöntemi</p>
                <p className="text-sm font-semibold text-gray-800">{paymentLabel[order.paymentMethod]}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Toplam Tutar</p>
                <p className="text-sm font-semibold text-gray-800">₺{order.totalAmount?.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Durum</p>
                <p className="text-sm font-semibold text-amber-600">Beklemede</p>
              </div>
            </div>

            {/* Sipariş Edilen Ürünler */}
            {order.items && order.items.length > 0 && (
              <div className={`bg-gray-50 rounded-xl p-5 text-left mb-8 transition-all duration-500 delay-[1000ms] ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <p className="font-bold text-sm text-gray-800">Sipariş Özeti ({order.items.length} ürün)</p>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                      {/* Ürün Görseli */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {(item.productImage || item.product?.colors?.[0]?.images?.[0]) ? (
                          <img 
                            src={getImageUrl(item.productImage || item.product?.colors?.[0]?.images?.[0])} 
                            alt={item.productName || item.product?.name || 'Ürün'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      {/* Ürün Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.productName || item.product?.name || 'Ürün'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Renk: {item.selectedColor}</span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-500">Beden: {item.selectedSize}</span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-500">Adet: {item.quantity}</span>
                        </div>
                      </div>
                      {/* Fiyat */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-400">Birim: ₺{item.price?.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Fiyat Özeti */}
                <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ara Toplam</span>
                    <span>₺{order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Kargo ({order.shippingCompany})</span>
                    <span>₺{order.shippingCost?.toFixed(2)}</span>
                  </div>
                  {order.eftSurcharge > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>EFT İndirimi</span>
                      <span className="text-green-600">-₺{order.eftSurcharge?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Toplam</span>
                    <span>₺{order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Havale/EFT Hatırlatma */}
            {order.paymentMethod === 'havale-eft' && (
              <div className={`bg-amber-50 border border-amber-200 rounded-xl p-5 text-left mb-8 transition-all duration-500 delay-[1100ms] ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <p className="text-sm font-bold text-amber-800 mb-2">Havale/EFT Hatırlatma</p>
                <p className="text-xs text-amber-700">
                  Lütfen ödemenizi en kısa sürede yapın ve dekontunuzu WhatsApp hattımıza gönderin. 
                  Açıklama kısmına sipariş numaranızı (<strong>{order.orderNumber}</strong>) yazmayı unutmayın.
                </p>
              </div>
            )}

            {/* Teslimat */}
            <div className={`bg-gray-50 rounded-xl p-5 text-left mb-8 transition-all duration-500 delay-[1100ms] ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <p className="font-bold text-sm text-gray-800">Teslimat Bilgileri</p>
              </div>
              <p className="text-sm text-gray-600">
                {order.customerInfo?.firstName} {order.customerInfo?.lastName}<br />
                {order.customerInfo?.neighborhood}, {order.customerInfo?.addressDetail}<br />
                {order.customerInfo?.district} / {order.customerInfo?.city}<br />
                {order.customerInfo?.phone}
              </p>
            </div>

            {/* Geri sayım ve yönlendirme */}
            <div className={`transition-all duration-500 delay-[1300ms] ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {/* Geri sayım göstergesi */}
              <div className="mb-5">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-3">
                  <Home className="w-4 h-4" />
                  <span><strong className="text-gray-800">{countdown}</strong> saniye sonra ana sayfaya yönlendirileceksiniz</span>
                </div>
                {/* İlerleme çubuğu */}
                <div className="w-full max-w-xs mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    navigate('/', { replace: true });
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ana Sayfaya Git
                </button>
                <Link
                  to="/store"
                  onClick={() => { if (countdownRef.current) clearInterval(countdownRef.current); }}
                  className="flex-1 border-2 border-gray-200 text-gray-800 py-4 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  Alışverişe Devam Et <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
