import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Truck, Building2, CreditCard, Banknote, Copy, Check, Info, ChevronDown, ChevronUp, Shield, Package, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import api from '../utils/axios';
import Navbar from '../components/Layout/Navbar';
import getImageUrl from '../utils/imageUrl';
import SEO from '../components/SEO';

// Türkiye şehirleri
const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
  'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
  'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalPrice, clearCart } = useCart();
  
  // Cart'tan gelen kargo seçimi
  const [selectedShipping, setSelectedShipping] = useState(location.state?.selectedShipping || 'surat');

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    neighborhood: '',
    addressDetail: '',
    orderNote: '',
  });

  // Fatura state
  const [differentBilling, setDifferentBilling] = useState(false);
  const [billingType, setBillingType] = useState('bireysel');
  const [billingForm, setBillingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    addressDetail: '',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
  });

  // Ödeme yöntemi
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // EFT Modal
  const [showEftModal, setShowEftModal] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);

  // Sözleşme onayı
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Gönderme durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Sepet boşsa mağazaya yönlendir
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Toplam ürün adedi
  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Çift ürün indirimi hesaplama
  const pricingInfo = useMemo(() => {
    const originalTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const pairs = Math.floor(totalItemCount / 2);
    const remaining = totalItemCount % 2;

    if (pairs === 0) {
      return {
        originalTotal,
        discountedTotal: originalTotal,
        pairCount: 0,
        remainingCount: remaining,
        remainingPrice: originalTotal,
        discount: 0,
        hasPairDiscount: false,
      };
    }

    const pairTotal = pairs * 899;
    let remainingPrice = 0;
    if (remaining > 0) {
      const allPrices = [];
      cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          allPrices.push(item.price);
        }
      });
      allPrices.sort((a, b) => a - b);
      remainingPrice = allPrices[0];
    }

    const discountedTotal = pairTotal + remainingPrice;
    const discount = originalTotal - discountedTotal;

    return {
      originalTotal,
      discountedTotal,
      pairCount: pairs,
      remainingCount: remaining,
      remainingPrice,
      discount,
      hasPairDiscount: true,
    };
  }, [cart, totalItemCount]);

  // Fiyat hesaplama
  const subtotal = pricingInfo.discountedTotal;
  const shippingCost = selectedShipping === 'surat' ? 100 : 150;
  const eftSurcharge = paymentMethod === 'havale-eft' ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const total = subtotal + shippingCost + eftSurcharge;

  // Form güncelleme
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleBillingChange = (field, value) => {
    setBillingForm(prev => ({ ...prev, [field]: value }));
  };

  // IBAN kopyalama
  const handleCopyIban = () => {
    navigator.clipboard.writeText('TR90 0021 0000 0013 5602 2000 01');
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };

  // Form validasyonu
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Adınızı giriniz';
    if (!form.lastName.trim()) errs.lastName = 'Soyadınızı giriniz';
    if (!form.phone.trim()) errs.phone = 'Telefon numaranızı giriniz';
    if (!form.email.trim()) errs.email = 'Email adresinizi giriniz';
    if (!form.city) errs.city = 'Şehir seçiniz';
    if (!form.district.trim()) errs.district = 'İlçe giriniz';
    if (!form.neighborhood.trim()) errs.neighborhood = 'Mahalle/Sokak giriniz';
    if (!form.addressDetail.trim()) errs.addressDetail = 'Detaylı adres giriniz';
    if (!paymentMethod) errs.paymentMethod = 'Ödeme yöntemi seçiniz';
    if (!termsAccepted) errs.terms = 'Sözleşmeyi onaylamanız gerekmektedir';

    // Farklı fatura adresi seçildiyse
    if (differentBilling) {
      if (!billingForm.firstName.trim()) errs.billingFirstName = 'Fatura adınızı giriniz';
      if (!billingForm.lastName.trim()) errs.billingLastName = 'Fatura soyadınızı giriniz';
      if (!billingForm.city) errs.billingCity = 'Fatura şehri seçiniz';
      if (!billingForm.district.trim()) errs.billingDistrict = 'Fatura ilçesi giriniz';
      if (!billingForm.neighborhood.trim()) errs.billingNeighborhood = 'Fatura mahalle/sokak giriniz';
      if (!billingForm.addressDetail.trim()) errs.billingAddressDetail = 'Fatura detaylı adresi giriniz';
      if (billingType === 'kurumsal') {
        if (!billingForm.companyName.trim()) errs.companyName = 'Firma adı giriniz';
        if (!billingForm.taxOffice.trim()) errs.taxOffice = 'Vergi dairesi giriniz';
        if (!billingForm.taxNumber.trim()) errs.taxNumber = 'Vergi numarası giriniz';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Sipariş gönder
  const handleSubmit = async () => {
    if (!validate()) {
      // İlk hatalı alana scroll
      const firstError = document.querySelector('.border-red-400');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          district: form.district,
          neighborhood: form.neighborhood,
          addressDetail: form.addressDetail,
          orderNote: form.orderNote,
        },
        billingInfo: differentBilling ? {
          useDifferentAddress: true,
          type: billingType,
          ...billingForm,
        } : {
          useDifferentAddress: false,
          type: 'bireysel',
        },
        paymentMethod,
        items: cart.map(item => ({
          product: item.productId,
          productName: item.product?.name || '',
          productImage: item.image || '',
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shippingCost,
        eftSurcharge,
        totalAmount: total,
        shippingCompany: selectedShipping === 'surat' ? 'Sürat Kargo' : 'PTT Kargo',
      };

      const response = await api.post('/orders', orderData);
      clearCart();
      navigate('/order-success', { state: { order: response.data } });
    } catch (error) {
      console.error('Sipariş hatası:', error);
      alert(error.response?.data?.error || 'Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // EFT modal onay - sadece modalı kapat
  const handleEftConfirm = () => {
    setShowEftModal(false);
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Sipariş Oluştur" description="Siparişinizi tamamlayın." url="/checkout" noindex={true} />
      <Navbar />
      
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Başlık */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate('/cart')} className="text-gray-500 hover:text-black transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Sipariş Oluştur</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* ===== SOL BÖLÜM: FORM ===== */}
            <div className="flex-1 space-y-6">

              {/* --- STEP INDICATOR --- */}
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
                <Link to="/cart" className="hover:text-black transition-colors">Sepet</Link>
                <span>›</span>
                <span className="text-black">Ödeme</span>
                <span>›</span>
                <span>Onay</span>
              </div>

              {/* --- TESLİMAT BİLGİLERİ --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Teslimat Bilgileriniz</h2>
                    <p className="text-xs text-gray-400">Siparişiniz bu adrese gönderilecektir</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ad */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adınız <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Adınız"
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  {/* Soyad */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soyadınız <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Soyadınız"
                      value={form.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                  {/* Telefon */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cep Telefonunuz <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      placeholder="(5XX) XXX-XXXX"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Adresiniz <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="email@adresiniz.com"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  {/* Şehir */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şehir <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all appearance-none bg-white ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'} ${!form.city ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        <option value="">Şehir Seçin</option>
                        {CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  {/* İlçe */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">İlçe <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="İlçe adınızı yazın"
                      value={form.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.district ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                  </div>
                </div>

                {/* Mahalle/Sokak */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mahalle/Sokak <span className="text-red-500">*</span></label>
                  <textarea
                    placeholder="Mahalle, cadde, sokak bilgilerinizi yazın"
                    value={form.neighborhood}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none ${errors.neighborhood ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood}</p>}
                </div>

                {/* Detaylı Adres */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detaylı Adres (Bina No, Daire No, vb.) <span className="text-red-500">*</span></label>
                  <textarea
                    placeholder="Bina no, kat, daire no, diğer detaylar..."
                    value={form.addressDetail}
                    onChange={(e) => handleChange('addressDetail', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none ${errors.addressDetail ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.addressDetail && <p className="text-xs text-red-500 mt-1">{errors.addressDetail}</p>}
                </div>

                {/* Önemli bilgi */}
                <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <span className="font-bold">Önemli:</span> Adres bilgilerinizi eksiksiz doldurunuz. Eksik adres bilgileri teslimatı geciktirebilir veya iptal edilebilir.
                  </div>
                </div>

                {/* Fatura Adresi Farklı */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${differentBilling ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {differentBilling && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Fatura Adresim Farklı</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={differentBilling}
                    onChange={(e) => setDifferentBilling(e.target.checked)}
                    className="hidden"
                  />
                  <div onClick={() => setDifferentBilling(!differentBilling)} className="absolute" />
                </div>

                {/* Sipariş Notu */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sipariş Notu</label>
                  <textarea
                    placeholder="Sipariş ile ilgili notunuz varsa yazabilirsiniz..."
                    value={form.orderNote}
                    onChange={(e) => handleChange('orderNote', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none"
                  />
                </div>
              </div>

              {/* --- FATURA BİLGİLERİ (Farklı adres seçildiyse) --- */}
              {differentBilling && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Fatura Bilgileri</h2>
                      <p className="text-xs text-gray-400">Fatura adres bilgilerinizi giriniz</p>
                    </div>
                  </div>

                  {/* Bireysel / Kurumsal seçimi */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setBillingType('bireysel')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${billingType === 'bireysel' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      Bireysel
                    </button>
                    <button
                      onClick={() => setBillingType('kurumsal')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${billingType === 'kurumsal' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      Kurumsal
                    </button>
                  </div>

                  {/* Kurumsal bilgiler */}
                  {billingType === 'kurumsal' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Firma Adı <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Firma adı" value={billingForm.companyName} onChange={(e) => handleBillingChange('companyName', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                        {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vergi Dairesi <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Vergi dairesi" value={billingForm.taxOffice} onChange={(e) => handleBillingChange('taxOffice', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.taxOffice ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                        {errors.taxOffice && <p className="text-xs text-red-500 mt-1">{errors.taxOffice}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vergi Numarası <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Vergi numarası" value={billingForm.taxNumber} onChange={(e) => handleBillingChange('taxNumber', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.taxNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                        {errors.taxNumber && <p className="text-xs text-red-500 mt-1">{errors.taxNumber}</p>}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Ad" value={billingForm.firstName} onChange={(e) => handleBillingChange('firstName', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.billingFirstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      {errors.billingFirstName && <p className="text-xs text-red-500 mt-1">{errors.billingFirstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soyad <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Soyad" value={billingForm.lastName} onChange={(e) => handleBillingChange('lastName', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.billingLastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      {errors.billingLastName && <p className="text-xs text-red-500 mt-1">{errors.billingLastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şehir <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select value={billingForm.city} onChange={(e) => handleBillingChange('city', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all appearance-none bg-white ${errors.billingCity ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                          <option value="">Şehir Seçin</option>
                          {CITIES.map(city => (<option key={city} value={city}>{city}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.billingCity && <p className="text-xs text-red-500 mt-1">{errors.billingCity}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">İlçe <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="İlçe" value={billingForm.district} onChange={(e) => handleBillingChange('district', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${errors.billingDistrict ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      {errors.billingDistrict && <p className="text-xs text-red-500 mt-1">{errors.billingDistrict}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mahalle/Sokak <span className="text-red-500">*</span></label>
                    <textarea placeholder="Mahalle, cadde, sokak" value={billingForm.neighborhood} onChange={(e) => handleBillingChange('neighborhood', e.target.value)} rows={2} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none ${errors.billingNeighborhood ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors.billingNeighborhood && <p className="text-xs text-red-500 mt-1">{errors.billingNeighborhood}</p>}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detaylı Adres <span className="text-red-500">*</span></label>
                    <textarea placeholder="Bina no, kat, daire no..." value={billingForm.addressDetail} onChange={(e) => handleBillingChange('addressDetail', e.target.value)} rows={2} className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none ${errors.billingAddressDetail ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors.billingAddressDetail && <p className="text-xs text-red-500 mt-1">{errors.billingAddressDetail}</p>}
                  </div>
                </div>
              )}

              {/* --- ÖDEME YÖNTEMLERİ --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Ödeme Şekliniz</h2>
                    <p className="text-xs text-gray-400">Ödeme yönteminizi seçiniz</p>
                  </div>
                </div>
                {errors.paymentMethod && <p className="text-xs text-red-500 mb-3">{errors.paymentMethod}</p>}

                <div className="space-y-3">
                  {/* Havale/EFT */}
                  <label
                    onClick={() => { setPaymentMethod('havale-eft'); setShowEftModal(true); }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'havale-eft' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'havale-eft' ? 'border-black' : 'border-gray-300'}`}>
                      {paymentMethod === 'havale-eft' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <Building2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-gray-800 flex-1">HAVALE/EFT İLE ÖDEME</span>
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">+%5</span>
                  </label>

                  {/* Kapıda Nakit */}
                  <label
                    onClick={() => setPaymentMethod('kapida-nakit')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'kapida-nakit' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'kapida-nakit' ? 'border-black' : 'border-gray-300'}`}>
                      {paymentMethod === 'kapida-nakit' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <Banknote className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-gray-800 flex-1">KAPIDA NAKİT ÖDEME</span>
                  </label>

                  {/* Kapıda Kredi Kartı */}
                  <label
                    onClick={() => setPaymentMethod('kapida-kredikarti')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'kapida-kredikarti' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'kapida-kredikarti' ? 'border-black' : 'border-gray-300'}`}>
                      {paymentMethod === 'kapida-kredikarti' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-gray-800 flex-1">KAPIDA KREDİ KARTI İLE ÖDEME</span>
                  </label>
                </div>
              </div>

              {/* --- KARGO FİRMASI --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Kargo Firması</h2>
                    <p className="text-xs text-gray-400">Kargo firmanızı seçiniz</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Sürat Kargo */}
                  <label
                    onClick={() => setSelectedShipping('surat')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedShipping === 'surat' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedShipping === 'surat' ? 'border-black' : 'border-gray-300'}`}>
                      {selectedShipping === 'surat' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">Sürat Kargo</p>
                      <p className="text-xs text-gray-500">2-3 iş günü içinde teslimat</p>
                    </div>
                    <span className="font-bold text-sm text-gray-800">₺100</span>
                  </label>

                  {/* PTT Kargo */}
                  <label
                    onClick={() => setSelectedShipping('ptt')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedShipping === 'ptt' ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedShipping === 'ptt' ? 'border-black' : 'border-gray-300'}`}>
                      {selectedShipping === 'ptt' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">PTT Kargo</p>
                      <p className="text-xs text-gray-500">3-5 iş günü içinde teslimat</p>
                    </div>
                    <span className="font-bold text-sm text-gray-800">₺150</span>
                  </label>
                </div>
              </div>

              {/* --- SÖZLEŞME VE ONAY (Mobilde görünür) --- */}
              <div className="lg:hidden space-y-4">
                {/* Sipariş Özeti - Mobil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
                  
                  {/* Ürünler listesi */}
                  <div className="space-y-3 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Görsel</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name || 'Ürün'}</p>
                          <p className="text-xs text-gray-500">{item.selectedColor} / {item.selectedSize} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam ({totalItemCount} ürün)</span>
                      <span className={`font-semibold ${pricingInfo.hasPairDiscount ? 'line-through text-gray-400' : ''}`}>
                        ₺{pricingInfo.originalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {pricingInfo.hasPairDiscount && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 space-y-1">
                        <div className="flex justify-between text-green-700 text-xs font-semibold">
                          <span>🎯 {pricingInfo.pairCount} Çift × 899 ₺</span>
                          <span>₺{(pricingInfo.pairCount * 899).toLocaleString('tr-TR')}</span>
                        </div>
                        {pricingInfo.remainingCount > 0 && (
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>+ 1 Tek Ürün</span>
                            <span>₺{pricingInfo.remainingPrice.toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-green-600 text-xs font-bold pt-1 border-t border-green-200">
                          <span>Tasarruf</span>
                          <span>-₺{pricingInfo.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo ({selectedShipping === 'surat' ? 'Sürat' : 'PTT'})</span>
                      <span className="font-semibold">₺{shippingCost.toFixed(2)}</span>
                    </div>
                    {eftSurcharge > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Havale/EFT Ek Ücreti (%5)</span>
                        <span className="font-semibold">₺{eftSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-100">
                      <span>Toplam</span>
                      <span>₺{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Sözleşme onayı */}
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-white rounded-2xl border border-gray-100" onClick={() => setTermsAccepted(!termsAccepted)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${termsAccepted ? 'bg-black border-black' : 'border-gray-300'}`}>
                    {termsAccepted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Ön satış bilgilendirme, satın alma kurallarını ve kişisel verilerin koruma korunması kurallarını okudum ve onaylıyorum.
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 px-4">{errors.terms}</p>}

                {/* Sipariş onayla butonu */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black tracking-wider text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      İŞLENİYOR...
                    </span>
                  ) : (
                    'SİPARİŞİ ONAYLA'
                  )}
                </button>
              </div>
            </div>

            {/* ===== SAĞ BÖLÜM: SİPARİŞ ÖZETİ (Desktop) ===== */}
            <div className="hidden lg:block lg:w-[380px] flex-shrink-0">
              <div className="sticky top-28 space-y-4">
                
                {/* Sipariş Özeti */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h3>

                  {/* Ürünler */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Görsel</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{item.product?.name || 'Ürün'}</p>
                          <p className="text-[10px] text-gray-500">{item.selectedColor} / {item.selectedSize} × {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-gray-800">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam ({totalItemCount} ürün)</span>
                      <span className={`font-semibold ${pricingInfo.hasPairDiscount ? 'line-through text-gray-400' : ''}`}>
                        ₺{pricingInfo.originalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {pricingInfo.hasPairDiscount && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 space-y-1">
                        <div className="flex justify-between text-green-700 text-xs font-semibold">
                          <span>🎯 {pricingInfo.pairCount} Çift × 899 ₺</span>
                          <span>₺{(pricingInfo.pairCount * 899).toLocaleString('tr-TR')}</span>
                        </div>
                        {pricingInfo.remainingCount > 0 && (
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>+ 1 Tek Ürün</span>
                            <span>₺{pricingInfo.remainingPrice.toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-green-600 text-xs font-bold pt-1 border-t border-green-200">
                          <span>Tasarruf</span>
                          <span>-₺{pricingInfo.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo ({selectedShipping === 'surat' ? 'Sürat' : 'PTT'})</span>
                      <span className="font-semibold">₺{shippingCost.toFixed(2)}</span>
                    </div>
                    {eftSurcharge > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Havale/EFT (%5)</span>
                        <span className="font-semibold">+₺{eftSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black pt-3 border-t border-gray-100">
                      <span>Toplam</span>
                      <span>₺{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Sözleşme */}
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-white rounded-2xl border border-gray-100" onClick={() => setTermsAccepted(!termsAccepted)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${termsAccepted ? 'bg-black border-black' : 'border-gray-300'}`}>
                    {termsAccepted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Ön satış bilgilendirme, satın alma kurallarını ve kişisel verilerin koruma korunması kurallarını okudum ve onaylıyorum.
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 px-4">{errors.terms}</p>}

                {/* Sipariş onayla */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black tracking-wider text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      İŞLENİYOR...
                    </span>
                  ) : (
                    'SİPARİŞİ ONAYLA'
                  )}
                </button>

                {/* Güvenlik */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Güvenli ödeme altyapısı ile korunmaktadır</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HAVALE/EFT BİLGİ MODAL ===== */}
      {showEftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Havale/EFT Bilgileri</h3>
              <button onClick={() => setShowEftModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banka bilgileri */}
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                <p className="text-sm font-bold text-gray-800">Banka Bilgileri</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-semibold text-gray-800">Hesap Sahibi:</span> ABDURRAHMAN ELİSMAİL</p>
                  <p><span className="font-semibold text-gray-800">IBAN:</span> TR90 0021 0000 0013 5602 2000 01</p>
                  <p><span className="font-semibold text-gray-800">Banka:</span> Vakıf Katılım</p>
                </div>
              </div>
            </div>

            {/* Önemli notlar */}
            <div className="px-6 pb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="text-sm font-bold text-amber-800 mb-3">Önemli Notlar</p>
                <ul className="space-y-2 text-xs text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Havale/EFT işlemi için <strong>+%5 ek ücret</strong> alınmaktadır</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Ödemenizi yaptıktan sonra dekontunuzu <strong>WhatsApp hattımıza</strong> gönderin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Sipariş numaranızı açıklama kısmına yazmayı unutmayın</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Ödeme onaylandıktan sonra siparişiniz hazırlanmaya başlayacaktır</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Butonlar */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleEftConfirm}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-800 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                ANLADIM
              </button>
              <button
                onClick={handleCopyIban}
                className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                {ibanCopied ? (
                  <><Check className="w-4 h-4" /> KOPYALANDI</>
                ) : (
                  <><Copy className="w-4 h-4" /> IBAN'I KOPYALA</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Checkout;

