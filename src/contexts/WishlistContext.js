import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
// import wishlistApi from '../api/wishlistApi'; // Chúng ta sẽ tạo file này sau

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user, token } = useAuth();
     const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  useEffect(() => {
    // Khi người dùng đăng nhập, lấy danh sách yêu thích của họ từ backend
    const fetchWishlist = async () => {
      if (user) {
        // const response = await wishlistApi.getWishlist(token);
        // setWishlist(response.data);
        console.log("Fetching wishlist for user...");
      } else {
        // Nếu đăng xuất, xóa danh sách yêu thích
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [user, token]);

  const addToWishlist = async (product) => {
    // const response = await wishlistApi.addToWishlist(product.id, token);
    // setWishlist(response.data);
    
    // Logic tạm thời vì chưa có API
    setWishlist(prev => [...prev, product.id]);
    console.log(`Added ${product.name} to wishlist.`);
  };

  const removeFromWishlist = async (productId) => {
    // const response = await wishlistApi.removeFromWishlist(productId, token);
    // setWishlist(response.data);

    // Logic tạm thời
    setWishlist(prev => prev.filter(id => id !== productId));
    console.log(`Removed ${productId} from wishlist.`);
  };
  
  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        addToWishlist, 
        removeFromWishlist, 
        isInWishlist,
        isWishlistOpen, // <-- Thêm vào context
        openWishlist,   // <-- Thêm vào context
        closeWishlist   // <-- Thêm vào context
      }}
    >
      {children}
    </WishlistContext.Provider>);
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};