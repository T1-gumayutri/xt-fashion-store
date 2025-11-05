import React from 'react';
import { CartProvider } from './contexts/CartContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage/ReturnPolicyPage'; 
import './assets/styles/main.scss';
import FaqPage from './pages/FaqPage/FaqPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import ScrollToTop from './components/common/ScrollToTop';
import ShirtListPage from './pages/ShirtListPage/ShirtListPage';
import AccessoriesListPage from './pages/AccessoriesListPage/AccessoriesListPage';
import PantsListPage from './pages/PantsListPage/PantsListPage';
import CollectionPage from './pages/CollectionPage/CollectionPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import { AuthProvider } from './contexts/AuthContext'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import CartPage from './pages/CartPage/CartPage';
import SideCart from './components/cart/SideCart';
import SideWishlist from './components/wishlist/SideWishlist';
import { WishlistProvider } from './contexts/WishlistContext';
import PromotionsPage from './pages/PromotionsPage/PromotionsPage'; 
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';

// Admin (nested)
import AdminPage from './pages/AdminPage/AdminPage';
import Dashboard from './pages/AdminPage/Dashboard/Dashboard';
import AdminProducts from './pages/AdminPage/AdminProducts/AdminProducts';
import AdminOrders from './pages/AdminPage/AdminOrders/AdminOrders';
import AdminUsers from './pages/AdminPage/AdminUsers/AdminUsers';
import AdminPromotions from './pages/AdminPage/AdminPromotions/AdminPromotions';
import AdminReviews from "./pages/AdminPage/AdminReviews/AdminReviews";

// --- IMPORT MỚI CHO TRANG PROFILE ---
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
// -------------------------------------
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
const GOOGLE_CLIENT_ID ="1092411273263-rm0r8kjh9d3684n7pro1u1ublfht6ddg.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
    <Router>
      <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      <ScrollToTop />
      <SideCart />
      <SideWishlist />
      <div className="App">
        <Routes>
          {/* Các Route công khai */}
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} /> 
          <Route path="/ao-xuan-he" element={<ShirtListPage />} /> 
          <Route path="/quan" element={<PantsListPage />} /> 
          <Route path="/phu-kien" element={<AccessoriesListPage />} /> 
          <Route path="/collections/:subCategory" element={<CollectionPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} /> 
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/khuyen-mai" element={<PromotionsPage />} /> 
          <Route path="/search" element={<SearchResultsPage />} /> 

          {/* 🧭 Admin nested routes */}
                  <Route path="/admin" element={<AdminPage />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="promotions" element={<AdminPromotions />} />
                    <Route path="reviews" element={<AdminReviews />} />
                  </Route>

          {/* --- CÁC ROUTE CẦN BẢO VỆ (PHẢI ĐĂNG NHẬP) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            {/* Thêm các route cần đăng nhập khác vào đây sau này */}
          </Route>
          
        </Routes>
      </div>
    </Router>
    </WishlistProvider>
    </CartProvider>
    </AuthProvider>
     </GoogleOAuthProvider>
  );
}

export default App;