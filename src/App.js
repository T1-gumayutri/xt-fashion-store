import React from 'react';
import { CartProvider } from './contexts/CartContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage/ReturnPolicyPage'; // <-- IMPORT THE NEW PAGE
import './assets/styles/main.scss';
import FaqPage from './pages/FaqPage/FaqPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import ScrollToTop from './components/common/ScrollToTop';
import ProductListPage from './pages/ProductListPage/ProductListPage';
import AccessoriesListPage from './pages/AccessoriesListPage/AccessoriesListPage';
import PantsListPage from './pages/PantsListPage/PantsListPage';
import CollectionPage from './pages/CollectionPage/CollectionPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import { AuthProvider } from './contexts/AuthContext'; // <-- IMPORT AUTHPROVIDER
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify'; // <-- IMPORT
import 'react-toastify/dist/ReactToastify.css'; 
import CartPage from './pages/CartPage/CartPage';
import SideCart from './components/cart/SideCart';
import SideWishlist from './components/wishlist/SideWishlist';
import { WishlistProvider } from './contexts/WishlistContext';
import PromotionsPage from './pages/PromotionsPage/PromotionsPage'; 
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
const GOOGLE_CLIENT_ID ="1092411273263-rm0r8kjh9d3684n7pro1u1ublfht6ddg.apps.googleusercontent.com";
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
    <Router>
      <ToastContainer // <-- THÊM COMPONENT NÀY
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
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} /> {/* <-- THÊM ROUTE */}
          <Route path="/ao-xuan-he" element={<ProductListPage />} /> {/* <-- THÊM ROUTE MỚI */}
          <Route path="/quan" element={<PantsListPage />} /> {/* <-- THÊM ROUTE MỚI */}
          <Route path="/phu-kien" element={<AccessoriesListPage />} /> {/* <-- THÊM ROUTE MỚI */}
          <Route path="/collections/:subCategory" element={<CollectionPage />} />
           <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} /> {/* <-- ADD THE NEW ROUTE */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/khuyen-mai" element={<PromotionsPage />} /> {/* <-- THÊM ROUTE */}
          <Route path="/checkout" element={<CheckoutPage />} /> {/* <-- THÊM ROUTE */}
          {/* Add other pages here in the future */}
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