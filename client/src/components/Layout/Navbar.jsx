import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      // Scroll durumu
      setScrolled(currentY > 50);

      // Aşağı scroll → gizle, yukarı scroll → göster
      if (currentY > lastScrollY.current && currentY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menü açıkken scroll engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  // Anasayfa: başta beyaz, scroll'da siyah. Diğer sayfalar: her zaman siyah
  const useLightText = isHomePage && !scrolled;

  const navLinks = [
    { name: 'ANASAYFA', path: '/' },
    { name: 'MAĞAZA', path: '/store' },
  ];

  return (
    <>
      {/* Sabit Üst Blok: Marquee + Navbar birlikte */}
      <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}>
        {/* Kayan Yazı (Marquee) */}
        <div className={`bg-black text-white overflow-hidden whitespace-nowrap border-b border-gray-800 transition-all duration-300 ${
          scrolled ? 'py-1' : 'py-2'
        }`}>
          <div className="animate-marquee inline-block">
            <span className="mx-4 font-bold tracking-widest text-sm md:text-base">🔥 YENİ SEZON ÜRÜNLERİ STOKLARDA</span>
            <span className="mx-4 text-gray-500">•</span>
            <span className="mx-4 font-bold tracking-widest text-sm md:text-base">👟 2. ÇİFTTE DEV İNDİRİM FIRSATI</span>
            <span className="mx-4 text-gray-500">•</span>
            <span className="mx-4 font-bold tracking-widest text-sm md:text-base">🔥 YENİ SEZON ÜRÜNLERİ STOKLARDA</span>
            <span className="mx-4 text-gray-500">•</span>
            <span className="mx-4 font-bold tracking-widest text-sm md:text-base">👟 2. ÇİFTTE DEV İNDİRİM FIRSATI</span>
          </div>
        </div>

        {/* Ana Navbar */}
        <nav className={`relative w-full transition-all duration-500 h-12 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : isHomePage ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm'
        }`}>
          <div className="container mx-auto px-4 md:px-8 flex items-center h-full md:ml-[-50px]">
            
            {/* Mobil Logo - Navbar solunda, bağımsız */}
            <Link to="/" className="absolute left-0 top-1/2 -translate-y-1/2 flex md:hidden items-center w-[475px] h-[475px] overflow-hidden rounded-full z-10 shrink-0 -ml-[200px]">
              <img 
                src="/logo.png" 
                alt="PAPUÇGNC" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[16000px] w-[16000px] object-contain pointer-events-none" 
              />
            </Link>

            {/* Desktop Logo - Sol */}
            <Link to="/" className="relative hidden md:flex items-center self-center w-[500px] h-[500px] overflow-hidden rounded-full z-10 shrink-0">
              <img 
                src="/logo.png" 
                alt="PAPUÇGNC" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[3500px] w-[3500px] object-contain pointer-events-none" 
              />
            </Link>

            {/* Desktop Menu - Orta */}
            <div className={`hidden md:flex items-center justify-center flex-1 space-x-8 font-bold text-sm tracking-wide transition-colors duration-500 ${
              useLightText ? 'text-white' : 'text-gray-900'
            }`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1 transition-colors duration-300 ${
                    isActive(link.path) 
                      ? 'text-red-600' 
                      : 'hover:text-red-600'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-red-600" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop - Arama + Sepet (sola yakın) */}
            <div className={`hidden md:flex items-center space-x-4 transition-colors duration-500 ${
              useLightText ? 'text-white' : 'text-gray-900'
            }`}>
              {/* Arama */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:scale-110 transition-transform"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Sepet */}
              <button
                onClick={() => navigate('/cart')}
                className="relative hover:scale-110 transition-transform"
                aria-label="Sepet"
              >
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobil - Sağ ikonlar */}
            <div className={`flex md:hidden items-center space-x-4 ml-auto transition-colors duration-500 ${
              useLightText ? 'text-white' : 'text-gray-900'
            }`}>
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:scale-110 transition-transform"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="relative hover:scale-110 transition-transform"
                aria-label="Sepet"
              >
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ---- Mobil Menü (Slide-in Panel) ---- */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[70] transform transition-transform duration-400 ease-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobil Menü Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
            <img src="/logo.png" alt="PAPUÇGNC" className="h-20 w-20 rounded-full object-contain" />
            <span className="text-xl font-black italic">PAPUÇ<span className="text-red-600">GNC</span></span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 hover:rotate-90 transition-transform duration-300"
            aria-label="Menüyü kapat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobil Menü Linkleri */}
        <div className="flex-1 overflow-y-auto py-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-6 py-4 text-lg font-bold tracking-wide transition-colors ${
                isActive(link.path)
                  ? 'text-red-600 bg-red-50 border-l-4 border-red-600'
                  : 'text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              {link.name}
              <ChevronRight className={`w-5 h-5 ${isActive(link.path) ? 'text-red-600' : 'text-gray-300'}`} />
            </Link>
          ))}

          {/* Divider */}
          <div className="mx-6 my-4 border-t border-gray-100" />

          {/* Ek Linkler */}
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-6 py-4 text-base font-semibold text-gray-600 hover:bg-gray-50"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              SEPETİM
            </span>
            {getTotalItems() > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </Link>

          <button
            onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
            className="flex items-center gap-3 px-6 py-4 text-base font-semibold text-gray-600 hover:bg-gray-50 w-full text-left"
          >
            <Search className="w-5 h-5" />
            ARA
          </button>
        </div>

        {/* Mobil Menü Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            &copy; 2026 PAPUÇGNC. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* ---- Arama Overlay ---- */}
      <div
        className={`fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] transition-opacity duration-300 ${
          searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSearchOpen(false)}
      >
        <div
          className={`w-[90%] max-w-2xl transform transition-all duration-400 ${
            searchOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ne arıyorsun?"
                autoFocus={searchOpen}
                className="w-full bg-white text-black text-xl md:text-2xl font-bold px-14 py-5 outline-none placeholder:text-gray-300 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:rotate-90 transition-transform"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </form>
          <div className="bg-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">Popüler: <span className="text-gray-600 font-semibold">Sneakers, Spor Ayakkabı, Casual</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
