import { useState, useCallback, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import LoadingScreen from './components/LoadingScreen'
import PageTransition from './components/PageTransition'
import Navbar from './components/Layout/Navbar'

// Lazy loaded pages - code splitting
const Home = lazy(() => import('./pages/Home'))
const Store = lazy(() => import('./pages/Store'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Products = lazy(() => import('./pages/admin/Products'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'))

// Lazy loading fallback
const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin" />
      <span className="text-xs text-gray-400 font-medium tracking-wider">YÜKLENİYOR...</span>
    </div>
  </div>
)

// Admin şifre koruması
const ProtectedAdmin = ({ children }) => {
  const isAuth = sessionStorage.getItem('adminAuth') === 'true';
  if (!isAuth) {
    return <Navigate to="/adminjwan/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition>
      <Suspense fallback={<LazyFallback />}>
        <Routes location={location}>
          {/* Admin Login */}
          <Route path="/adminjwan/login" element={<AdminLogin />} />

          {/* Admin Routes - Şifre Korumalı */}
          <Route
            path="/adminjwan"
            element={
              <ProtectedAdmin>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedAdmin>
            }
          />
          <Route
            path="/adminjwan/products"
            element={
              <ProtectedAdmin>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </ProtectedAdmin>
            }
          />
          <Route
            path="/adminjwan/orders"
            element={
              <ProtectedAdmin>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </ProtectedAdmin>
            }
          />

          {/* Eski /admin URL'lerini yönlendir */}
          <Route path="/admin" element={<Navigate to="/adminjwan/login" replace />} />
          <Route path="/admin/*" element={<Navigate to="/adminjwan/login" replace />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route
            path="/product/:id"
            element={
              <>
                <Navbar />
                <ProductDetail />
              </>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
};

function App() {
  const [showLoading, setShowLoading] = useState(true)

  const handleLoadingFinish = useCallback(() => {
    setShowLoading(false)
  }, [])

  return (
    <CartProvider>
      {showLoading && <LoadingScreen onFinish={handleLoadingFinish} />}
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  )
}

export default App
