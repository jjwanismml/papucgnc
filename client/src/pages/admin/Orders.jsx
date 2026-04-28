import { useEffect, useState, useCallback, useRef } from 'react';
import { ShoppingCart, Package, Filter, Search } from 'lucide-react';
import api from '../../utils/axios';
import OrderCard from '../../components/admin/OrderCard';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const observerRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const currentSkip = reset ? 0 : skip;
      const response = await api.get(`/orders?limit=10&skip=${currentSkip}`);
      
      if (reset) {
        setOrders(response.data.orders);
      } else {
        setOrders((prev) => [...prev, ...response.data.orders]);
      }
      
      setHasMore(response.data.hasMore);
      setSkip(currentSkip + response.data.orders.length);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastOrderElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchOrders();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
    }
  };

  // Durum filtreleme
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const statusCounts = {
    all: orders.length,
    'Beklemede': orders.filter(o => o.status === 'Beklemede').length,
    'Onaylandı': orders.filter(o => o.status === 'Onaylandı').length,
    'Kargoya Verildi': orders.filter(o => o.status === 'Kargoya Verildi').length,
    'Teslim Edildi': orders.filter(o => o.status === 'Teslim Edildi').length,
  };

  const statusTabs = [
    { key: 'all', label: 'Tümü' },
    { key: 'Beklemede', label: 'Beklemede', dot: 'bg-amber-500' },
    { key: 'Onaylandı', label: 'Onaylandı', dot: 'bg-blue-500' },
    { key: 'Kargoya Verildi', label: 'Kargoda', dot: 'bg-violet-500' },
    { key: 'Teslim Edildi', label: 'Teslim', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Sipariş Yönetimi</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{orders.length} sipariş bulundu</p>
        </div>
      </div>

      {/* Status Tabs - Horizontal scrollable on mobile */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-1.5 sm:p-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 pb-0.5 snap-x snap-mandatory">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all snap-start min-w-fit touch-manipulation ${
                statusFilter === tab.key
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100'
              }`}
            >
              {tab.dot && <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${tab.dot} ${statusFilter === tab.key ? 'opacity-80' : ''}`}></span>}
              {tab.label}
              <span className={`text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {statusCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredOrders.map((order, index) => {
          if (orders.length === index + 1) {
            return (
              <div key={order._id} ref={lastOrderElementRef}>
                <OrderCard
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            );
          }
          return (
            <OrderCard
              key={order._id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Siparişler yükleniyor...</p>
          </div>
        </div>
      )}

      {!hasMore && orders.length > 0 && (
        <div className="text-center py-6 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-gray-500 text-xs sm:text-sm font-medium">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Tüm siparişler yüklendi
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center py-14 sm:py-20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold text-base sm:text-lg mb-1">Henüz sipariş yok</p>
          <p className="text-gray-400 text-xs sm:text-sm">İlk sipariş geldiğinde burada görünecek</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
