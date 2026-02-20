import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Home, ChevronRight, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/adminjwan', icon: LayoutDashboard, label: 'Dashboard', desc: 'Genel bakış' },
    { path: '/adminjwan/products', icon: Package, label: 'Ürünler', desc: 'Ürün & marka yönetimi' },
    { path: '/adminjwan/orders', icon: ShoppingCart, label: 'Siparişler', desc: 'Sipariş takibi' },
  ];

  const isActive = (path) => {
    if (path === '/adminjwan') {
      return location.pathname === '/adminjwan';
    }
    return location.pathname.startsWith(path);
  };

  // Çıkış yap fonksiyonu
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    window.location.href = '/adminjwan/login';
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10 group-hover:shadow-white/20 transition-shadow">
              <Home className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tight">Admin Panel</h1>
              <p className="text-gray-500 text-[10px] font-medium tracking-widest uppercase">Yönetim Merkezi</p>
            </div>
          </Link>
          {/* Mobile Close */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-3">Menü</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-white text-gray-900 shadow-lg shadow-white/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  active ? 'bg-gray-900 text-white' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold block ${active ? 'text-gray-900' : ''}`}>{item.label}</span>
                  <span className={`text-[10px] ${active ? 'text-gray-500' : 'text-gray-600'}`}>{item.desc}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-gray-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-1">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Mağazaya Git</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-gray-800">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-gray-400">
              {menuItems.find(item => isActive(item.path))?.desc || ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
