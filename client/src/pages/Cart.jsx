import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck, Package, Tag, Percent } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState, useMemo } from 'react';
import Navbar from '../components/Layout/Navbar';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState('aras'); // 'aras' veya 'ptt'

  // Toplam ürün adedi
  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Çift ürün indirimi hesaplama
  const pricingInfo = useMemo(() => {
    const originalTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const pairs = totalItemCount; // her sepet ürünü = 1 çift

    if (pairs === 0) {
      return {
        originalTotal,
        discountedTotal: originalTotal,
        pairCount: 0,
        pairTotal: 0,
        bundles: 0,
        singlePairs: 0,
        remainingCount: 0,
        remainingPrice: 0,
        discount: 0,
        hasPairDiscount: false,
      };
    }

    // Çift indirim - 1 çift 899₺, 2 çift 1199₺
    const bundles = Math.floor(pairs / 2);   // 2-çift paketler (1199₺)
    const singlePairs = pairs % 2;            // tekli çiftler (899₺)
    const pairTotal = bundles * 1199 + singlePairs * 899;

    // Çizili fiyat toplamı (tasarruf hesabı için)
    const allOriginalPrices = [];
    cart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        allOriginalPrices.push(item.originalPrice || item.price);
      }
    });
    const pairOriginalPriceTotal = allOriginalPrices.reduce((sum, p) => sum + p, 0);
    const discount = pairOriginalPriceTotal - pairTotal;

    const discountedTotal = pairTotal;

    return {
      originalTotal,
      discountedTotal,
      pairCount: pairs,
      pairTotal,
      bundles,
      singlePairs,
      remainingCount: 0,
      remainingPrice: 0,
      discount,
      hasPairDiscount: true,
    };
  }, [cart, totalItemCount]);

  // Kargo ücreti
  const shippingCost = selectedShipping === 'aras' ? 100 : 200;

  // Toplam
  const total = pricingInfo.discountedTotal + shippingCost;

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.productId, item.selectedColor, item.selectedSize);
    } else {
      updateQuantity(item.productId, item.selectedColor, item.selectedSize, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <SEO title="Sepet" description="Alışveriş sepetiniz boş." url="/cart" noindex={true} />
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
        <Navbar />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-6">Sepetinize ürün eklemek için mağazaya göz atın</p>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Mağazaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Sepetim (${cart.length} ürün)`}
        description="Alışveriş sepetinizi görüntüleyin ve siparişinizi tamamlayın."
        url="/cart"
        noindex={true}
      />
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
      <Navbar />
      
      <div className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/store" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Sepetim</h1>
          </div>

          {/* Çift ürün kampanya banner */}
          {pricingInfo.pairCount < 2 && (
            <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">2 ÇİFTE ÖZEL FİYAT!</p>
                <p className="text-xs text-white/90">2 çift al, sadece <strong>1.199 ₺</strong> öde!</p>
              </div>
            </div>
          )}

          {pricingInfo.hasPairDiscount && (
            <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">🎉 ÇİFT İNDİRİMİ UYGULANDI!</p>
                <p className="text-xs text-white/90">
                  {pricingInfo.pairCount} çift = {pricingInfo.pairTotal.toLocaleString('tr-TR')} ₺
                  {pricingInfo.remainingCount > 0 && ` + 1 ürün ${pricingInfo.remainingPrice.toLocaleString('tr-TR')} ₺`}
                  {' '}— Toplam <strong>{pricingInfo.discount.toLocaleString('tr-TR')} ₺ tasarruf</strong> ettiniz!
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sepet İçeriği */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Sepetim ({totalItemCount} ürün)
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.map((item, index) => (
                    <div key={index} className="p-6 flex gap-4">
                      {/* Ürün Görseli */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.product?.name || 'Ürün'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Görsel Yok
                          </div>
                        )}
                      </div>

                      {/* Ürün Bilgileri */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.product?.name || 'Ürün'}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Renk: {item.selectedColor}</p>
                          <p>Numara: {item.selectedSize}</p>
                          <p className="font-semibold text-gray-800">
                            ₺{item.price.toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Miktar ve Sil */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                          className="text-red-600 hover:text-red-700 mb-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-2 font-semibold text-gray-800">
                          ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kargo Seçenekleri */}
              <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Kargo Seçenekleri
                </h3>
                <div className="space-y-3">
                  {/* Aras Kargo */}
                  <label
                    onClick={() => setSelectedShipping('aras')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping === 'aras' 
                        ? 'border-black bg-gray-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedShipping === 'aras' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {selectedShipping === 'aras' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src="https://image.hurimg.com/i/hurriyet/90/750x422/5e1c4e1f7af50714c889242e.jpg" alt="Aras Kargo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">Aras Kargo</p>
                      <p className="text-xs text-gray-500">2-3 iş günü içinde teslimat</p>
                    </div>
                    <span className="font-bold text-sm text-gray-800">₺100</span>
                  </label>

                  {/* PTT Kargo */}
                  <label
                    onClick={() => setSelectedShipping('ptt')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping === 'ptt' 
                        ? 'border-black bg-gray-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedShipping === 'ptt' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {selectedShipping === 'ptt' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src="https://kredilikargo.com.tr/wp-content/uploads/2024/06/ptt-kargo.webp" alt="PTT Kargo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">PTT Kargo</p>
                      <p className="text-xs text-gray-500">3-5 iş günü içinde teslimat</p>
                    </div>
                    <span className="font-bold text-sm text-gray-800">₺200</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Özet ve Sipariş */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-gray-50 border border-gray-200 p-6 sticky top-28 rounded-lg">
                <h3 className="text-xl font-black italic mb-6">SİPARİŞ ÖZETİ</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam ({totalItemCount} ürün)</span>
                    <span className={`font-bold ${pricingInfo.hasPairDiscount ? 'line-through text-gray-400' : 'text-black'}`}>
                      ₺{pricingInfo.originalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Çift indirimi detayı */}
                  {pricingInfo.hasPairDiscount && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between text-green-700 text-xs font-semibold">
                          <span>🎯 {pricingInfo.pairCount} Çift İndirimi</span>
                          <span>₺{pricingInfo.pairTotal.toLocaleString('tr-TR')}</span>
                        </div>
                        {pricingInfo.remainingCount > 0 && (
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>+ 1 Tek Ürün</span>
                            <span>₺{pricingInfo.remainingPrice.toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-green-700 text-xs font-bold pt-1 border-t border-green-200">
                          <span>İndirimli Toplam</span>
                          <span>₺{pricingInfo.discountedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Tasarruf</span>
                        <span>-₺{pricingInfo.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Kargo ({selectedShipping === 'aras' ? 'Aras' : 'PTT'})</span>
                    <span className="font-bold text-black">₺{shippingCost.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-black">
                    <span>TOPLAM</span>
                    <span>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/checkout', { state: { selectedShipping } })}
                    className="w-full bg-black text-white py-4 font-black tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    ÖDEMEYE GEÇ
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    Ödeme adımında güvenli şifreleme (SSL) kullanılmaktadır.
                  </p>
                </div>
                
                {/* Coupon Code */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs font-bold mb-2">KUPON KODU</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Kodu Giriniz" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 p-2 text-sm outline-none focus:border-black" 
                    />
                    <button 
                      onClick={() => {
                        if (couponCode.trim()) {
                          setAppliedCoupon(couponCode);
                          alert('Kupon kodu uygulandı!');
                        }
                      }}
                      className="bg-gray-200 text-black px-4 text-xs font-bold hover:bg-black hover:text-white transition-colors"
                    >
                      UYGULA
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 mt-2">Kupon uygulandı: {appliedCoupon}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
