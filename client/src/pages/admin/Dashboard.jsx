import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../utils/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Ciro',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      trend: '+3',
      trendUp: true,
    },
    {
      title: 'Bekleyen Sipariş',
      value: stats.pendingOrders,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      trend: stats.pendingOrders > 0 ? 'Aksiyon gerekli' : 'Temiz',
      trendUp: stats.pendingOrders === 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold">Genel Bakış</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Hoş geldiniz 👋</h1>
          <p className="text-gray-400 text-sm">Mağazanızın güncel durumunu buradan takip edebilirsiniz.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${card.bgLight} ${card.textColor}`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{card.title}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/admin/products" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Ürün Ekle</p>
              <p className="text-xs text-gray-400">Yeni ürün oluştur</p>
            </div>
          </a>
          <a href="/admin/orders" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-amber-600 transition-colors">Bekleyen Siparişler</p>
              <p className="text-xs text-gray-400">{stats.pendingOrders} sipariş bekliyor</p>
            </div>
          </a>
          <a href="/" target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Mağazayı Gör</p>
              <p className="text-xs text-gray-400">Canlı mağazayı aç</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
