import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import wishlistApi from '../api/wishlistApi';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { token } = useAuth();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (token) {
        try {
          const response = await wishlistApi.getWishlist(token);
          setWishlist(response.data);
        } catch (error) {
          console.error("Lỗi tải wishlist:", error);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [token]);

  //Thêm vào yêu thích
  const addToWishlist = async (product) => {
    if (!token) return alert("Vui lòng đăng nhập!");
    
    setWishlist(prev => [...prev, product]); 

    try {
      const id = product._id || product.id;
      const response = await wishlistApi.addToWishlist(id, token);
      setWishlist(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  //Xóa khỏi yêu thích
  const removeFromWishlist = async (productId) => {
    if (!token) return;

    setWishlist(prev => prev.filter(item => item._id !== productId && item.id !== productId));

    try {
      const response = await wishlistApi.removeFromWishlist(productId, token);
      setWishlist(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  //check
  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId || item.id === productId);
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
        isWishlistOpen,
        openWishlist,
        closeWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};