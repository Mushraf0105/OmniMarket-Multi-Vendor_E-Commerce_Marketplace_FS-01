import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorOnboardingPage from './pages/VendorOnboardingPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorStorePage from './pages/VendorStorePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Protected Route Wrapper for Vendor
const VendorRoute = ({ children }) => {
  const { user, loading, isVendor, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || (!isVendor && !isAdmin)) {
    return <Navigate to="/login?redirect=/vendor/dashboard" replace />;
  }
  return children;
};

// Protected Route Wrapper for Admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }
  return children;
};

// Protected Route for Authenticated Users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-slate-100">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public marketplace routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:idOrSlug" element={<ProductDetailPage />} />
                <Route path="/vendor/:id" element={<VendorStorePage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer order routes */}
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <CheckoutPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <PrivateRoute>
                      <OrderSuccessPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <OrderHistoryPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <PrivateRoute>
                      <OrderDetailPage />
                    </PrivateRoute>
                  }
                />

                {/* Vendor Portal routes */}
                <Route
                  path="/vendor/onboard"
                  element={
                    <PrivateRoute>
                      <VendorOnboardingPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/vendor/dashboard"
                  element={
                    <VendorRoute>
                      <VendorDashboardPage />
                    </VendorRoute>
                  }
                />
                <Route
                  path="/vendor/products"
                  element={
                    <VendorRoute>
                      <VendorProductsPage />
                    </VendorRoute>
                  }
                />

                {/* Admin Console routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

