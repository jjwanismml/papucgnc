import { useState } from 'react';
import { Package, User, MapPin, Phone, Calendar, ChevronDown, ChevronUp, Hash, Truck, CheckCircle, Clock, ShieldCheck, Mail, CreditCard, Building2, Banknote, FileText, MessageSquare, XCircle } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';

const statusConfig = {
  'Beklemede': { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock, 
    dot: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500'
  },
  'Onaylandı': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: ShieldCheck, 
    dot: 'bg-blue-500',
    gradient: 'from-blue-500 to-indigo-500'
  },
  'Kargoya Verildi': { 
    color: 'bg-violet-50 text-violet-700 border-violet-200', 
    icon: Truck, 
    dot: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-500'
  },
  'Teslim Edildi': { 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    icon: CheckCircle, 
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500'
  },
  'İptal Edildi': { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: XCircle, 
    dot: 'bg-red-500',
    gradient: 'from-red-500 to-rose-500'
  },
};

const paymentMethodLabels = {
  'kapida-nakit': { label: 'Kapıda Nakit', icon: Banknote, color: 'text-green-600 bg-green-50' },
  'kapida-kredikarti': { label: 'Kapıda Kredi Kartı', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  'havale-eft': { label: 'Havale / EFT', icon: Building2, color: 'text-orange-600 bg-orange-50' },
};

const OrderCard = ({ order, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const currentStatus = statusConfig[selectedStatus] || statusConfig['Beklemede'];
  const StatusIcon = currentStatus.icon;

  const payment = paymentMethodLabels[order.paymentMethod] || { label: order.paymentMethod, icon: CreditCard, color: 'text-gray-600 bg-gray-50' };
  const PaymentIcon = payment.icon;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    await onStatusUpdate(order._id, newStatus);
    setIsUpdating(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Müşteri adı
  const customerName = order.customerInfo?.firstName && order.customerInfo?.lastName
    ? `${order.customerInfo.firstName} ${order.customerInfo.lastName}`
    : order.customerInfo?.name || 'Bilinmiyor';

  // Tam adres
  const fullAddress = [
    order.customerInfo?.neighborhood,
    order.customerInfo?.addressDetail,
    order.customerInfo?.district,
    order.customerInfo?.city,
  ].filter(Boolean).join(', ') || order.customerInfo?.address || 'Adres belirtilmemiş';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
      {/* ========== HEADER ========== */}
      <div 
        className="p-3.5 sm:p-5 cursor-pointer active:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Mobile Layout: Stacked */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Status Indicator */}
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${currentStatus.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          
          {/* Info Area - Takes full width */}
          <div className="flex-1 min-w-0">
            {/* Top Row: Order Number + Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                {order.orderNumber ? `#${order.orderNumber}` : `#${order._id.slice(-6).toUpperCase()}`}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold border ${currentStatus.color}`}>
                <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${currentStatus.dot}`}></span>
                {selectedStatus}
              </span>
              <span className={`hidden xs:inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold ${payment.color}`}>
                <PaymentIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{payment.label}</span>
              </span>
            </div>
            
            {/* Bottom Row: Date + Customer + Items */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 flex-wrap">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-none">{formatDate(order.createdAt)}</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-gray-500 truncate max-w-[80px] sm:max-w-none">{customerName}</span>
              <span className="text-gray-300 hidden xs:inline">•</span>
              <span className="font-semibold text-gray-500 hidden xs:inline">{order.items?.length || 0} ürün</span>
            </div>

            {/* Mobile: Payment method + item count on separate line */}
            <div className="flex items-center gap-2 mt-1.5 xs:hidden">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${payment.color}`}>
                <PaymentIcon className="w-2.5 h-2.5" />
                {payment.label}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">{order.items?.length || 0} ürün</span>
            </div>
          </div>

          {/* Right Side: Price + Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Total - Always visible */}
            <div className="text-right">
              <p className="text-[9px] sm:text-xs text-gray-400 font-medium hidden sm:block">Toplam</p>
              <p className="text-sm sm:text-lg font-black text-gray-900 tracking-tight">₺{order.totalAmount?.toLocaleString('tr-TR')}</p>
            </div>
            
            {/* Status Dropdown - Prevent click propagation */}
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()}
              disabled={isUpdating}
              className={`hidden sm:block px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-bold cursor-pointer disabled:opacity-50 outline-none touch-manipulation ${currentStatus.color}`}
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="Kargoya Verildi">Kargoya Verildi</option>
              <option value="Teslim Edildi">Teslim Edildi</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>

            {/* Expand Toggle */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600 touch-manipulation"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile-only: Status dropdown below header */}
        <div className="sm:hidden mt-2.5 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-semibold">Durum:</span>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()}
              disabled={isUpdating}
              className={`flex-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer disabled:opacity-50 outline-none touch-manipulation ${currentStatus.color}`}
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="Kargoya Verildi">Kargoya Verildi</option>
              <option value="Teslim Edildi">Teslim Edildi</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========== EXPANDED CONTENT ========== */}
      {expanded && (
        <div className="border-t border-gray-100">

          {/* ===== MÜŞTERİ BİLGİ KUTUCUĞU + DİĞER BİLGİLER ===== */}
          <div className="p-3.5 sm:p-5 bg-gray-50/50">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              
              {/* SOL: Diğer detay bilgileri */}
              <div className="flex-1">
                <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Müşteri & Teslimat Bilgileri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Email */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1 flex items-center gap-1">
                      <Mail className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> E-posta
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {order.customerInfo?.email || 'Belirtilmemiş'}
                    </p>
                  </div>
                  {/* Kargo Firması */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1 flex items-center gap-1">
                      <Truck className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Kargo Firması
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{order.shippingCompany || 'Sürat Kargo'}</p>
                  </div>
                </div>

                {/* Sipariş Notu */}
                {order.customerInfo?.orderNote && (
                  <div className="mt-2.5 sm:mt-3 bg-amber-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-amber-100">
                    <p className="text-[9px] sm:text-[10px] text-amber-600 font-medium uppercase mb-0.5 sm:mb-1 flex items-center gap-1">
                      <MessageSquare className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Sipariş Notu
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-amber-800">{order.customerInfo.orderNote}</p>
                  </div>
                )}
              </div>

              {/* SAĞ: Müşteri Bilgi Kutucuğu */}
              <div className="lg:w-[300px] flex-shrink-0">
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-900 p-3.5 sm:p-5 shadow-lg shadow-gray-200/50 h-full">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-gray-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">Müşteri Bilgileri</h5>
                  </div>
                  <div className="space-y-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {customerName}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {order.customerInfo?.phone || 'Belirtilmemiş'}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed break-words">
                      {[order.customerInfo?.neighborhood, order.customerInfo?.addressDetail].filter(Boolean).join(', ') || 'Belirtilmemiş'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {[order.customerInfo?.city, order.customerInfo?.district].filter(Boolean).join(' ') || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ===== ÖDEME & KARGO BİLGİLERİ ===== */}
          <div className="p-3.5 sm:p-5 bg-white border-t border-gray-100">
            <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Ödeme & Kargo Bilgileri
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {/* Ödeme Yöntemi */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Ödeme</p>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <PaymentIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                  <p className="text-[11px] sm:text-sm font-bold text-gray-800 truncate">{payment.label}</p>
                </div>
              </div>
              {/* Kargo Firması */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Kargo</p>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                  <p className="text-[11px] sm:text-sm font-bold text-gray-800 truncate">{order.shippingCompany || 'Sürat Kargo'}</p>
                </div>
              </div>
              {/* Kargo Ücreti */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Kargo Ücreti</p>
                <p className="text-[11px] sm:text-sm font-bold text-gray-800">₺{(order.shippingCost || 0).toLocaleString('tr-TR')}</p>
              </div>
              {/* Ara Toplam */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Ara Toplam</p>
                <p className="text-[11px] sm:text-sm font-bold text-gray-800">₺{(order.subtotal || 0).toLocaleString('tr-TR')}</p>
              </div>
            </div>

            {/* EFT ek ücreti varsa */}
            {order.eftSurcharge > 0 && (
              <div className="mt-2.5 sm:mt-3 bg-orange-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-orange-100">
                <p className="text-[9px] sm:text-[10px] text-orange-600 font-medium uppercase mb-0.5 sm:mb-1">Havale/EFT Ek Ücreti (%5)</p>
                <p className="text-xs sm:text-sm font-bold text-orange-700">+₺{order.eftSurcharge.toLocaleString('tr-TR')}</p>
              </div>
            )}
          </div>

          {/* ===== FATURA BİLGİLERİ ===== */}
          {order.billingInfo && order.billingInfo.useDifferentAddress && (
            <div className="p-3.5 sm:p-5 bg-gray-50/50 border-t border-gray-100">
              <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Fatura Bilgileri
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${order.billingInfo.type === 'kurumsal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {order.billingInfo.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {/* Kurumsal fatura bilgileri */}
                {order.billingInfo.type === 'kurumsal' && (
                  <>
                    {order.billingInfo.companyName && (
                      <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Firma Adı</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-800 break-words">{order.billingInfo.companyName}</p>
                      </div>
                    )}
                    {order.billingInfo.taxOffice && (
                      <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Vergi Dairesi</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{order.billingInfo.taxOffice}</p>
                      </div>
                    )}
                    {order.billingInfo.taxNumber && (
                      <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Vergi Numarası</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{order.billingInfo.taxNumber}</p>
                      </div>
                    )}
                  </>
                )}
                {/* Fatura kişi bilgileri */}
                {(order.billingInfo.firstName || order.billingInfo.lastName) && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Fatura Ad Soyad</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {[order.billingInfo.firstName, order.billingInfo.lastName].filter(Boolean).join(' ')}
                    </p>
                  </div>
                )}
                {order.billingInfo.phone && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Fatura Telefon</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{order.billingInfo.phone}</p>
                  </div>
                )}
                {(order.billingInfo.city || order.billingInfo.district) && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Fatura Şehir / İlçe</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {[order.billingInfo.city, order.billingInfo.district].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}
              </div>
              {/* Fatura Adresi */}
              {(order.billingInfo.neighborhood || order.billingInfo.addressDetail) && (
                <div className="mt-2.5 sm:mt-3 bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-100">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase mb-0.5 sm:mb-1">Fatura Adresi</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-relaxed break-words">
                    {[order.billingInfo.neighborhood, order.billingInfo.addressDetail, order.billingInfo.district, order.billingInfo.city].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ===== SİPARİŞ ÜRÜNLERİ ===== */}
          <div className="p-3.5 sm:p-5 border-t border-gray-100">
            <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Sipariş Kalemleri ({order.items?.length || 0} ürün)
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                    {(item.productImage || item.product?.colors?.[0]?.images?.[0]) ? (
                      <img 
                        src={getImageUrl(item.productImage || item.product?.colors?.[0]?.images?.[0])} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-gray-800 truncate">
                      {item.productName || item.product?.name || 'Ürün bulunamadı'}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-gray-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: item.selectedColor?.startsWith('#') ? item.selectedColor : undefined }}></span>
                        <span className="truncate max-w-[50px] sm:max-w-none">{item.selectedColor}</span>
                      </span>
                      <span>No: {item.selectedSize}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-xs sm:text-sm text-gray-900">
                      ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[9px] sm:text-[10px] text-gray-400">₺{item.price.toLocaleString('tr-TR')} / ad.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== FİYAT ÖZETİ ===== */}
          <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5">
            <div className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Ara Toplam</span>
                <span className="text-gray-300 font-semibold">₺{(order.subtotal || 0).toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400 truncate mr-2">Kargo ({order.shippingCompany || 'Sürat Kargo'})</span>
                <span className="text-gray-300 font-semibold flex-shrink-0">₺{(order.shippingCost || 0).toLocaleString('tr-TR')}</span>
              </div>
              {order.eftSurcharge > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-orange-400">Havale/EFT Ek Ücreti</span>
                  <span className="text-orange-400 font-semibold">+₺{order.eftSurcharge.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-1.5 sm:pt-2 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-gray-300">Toplam Tutar</span>
                <span className="text-base sm:text-xl font-black text-white">
                  ₺{(order.totalAmount || 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
