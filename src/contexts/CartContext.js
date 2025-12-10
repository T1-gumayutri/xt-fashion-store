import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; 
import cartApi from '../api/cartApi';   

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); 

  // Load giỏ từ backend khi có token
  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        try {
          const res = await cartApi.getCart(token);
          setCartItems(res.data.items || []);
          setTotalPrice(res.data.totalPrice || 0);
        } catch (error) {
          console.error("Lỗi tải giỏ hàng:", error);
          setCartItems([]);
          setTotalPrice(0);
        }
      } else {
        setCartItems([]);
        setTotalPrice(0);
        setSelectedItems([]);
      }
    };
    fetchCart();
  }, [token]);

  // Khi cartItems thay đổi, tự động lọc lại selectedItems cho hợp lệ
  useEffect(() => {
    setSelectedItems(prevSelected => {
      const currentCartIds = cartItems
        .map(item => {
          const product = item.productId;
          if (!product) return null;
          const prodId = product.id || product._id;
          return `${prodId}-${item.color}-${item.size}`;
        })
        .filter(id => id !== null);

      return prevSelected.filter(id => currentCartIds.includes(id));
    });
  }, [cartItems]); 

  // --- CÁC HÀM THAO TÁC ---

  const addToCart = async (productData) => {
    if (!user) {
      toast.warn("Vui lòng đăng nhập để mua hàng!");
      return;
    }

    try {
      const res = await cartApi.addToCart(productData, token);
      setCartItems(res.data.items);
      setTotalPrice(res.data.totalPrice);
      setIsCartOpen(true);

      const newItemId = `${productData.productId}-${productData.color}-${productData.size}`;
      setSelectedItems(prev => {
        if (!prev.includes(newItemId)) {
          return [...prev, newItemId];
        }
        return prev;
      });

    } catch (error) {
      const msg = error.response?.data?.msg || "Lỗi thêm vào giỏ hàng";
      toast.error(msg);
    }
  };

  const updateQuantity = async (productId, color, size, newQuantity) => {
    try {
      const res = await cartApi.updateItem(
        { productId, color, size, quantity: newQuantity },
        token
      );
      setCartItems(res.data.items);
      setTotalPrice(res.data.totalPrice);
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = async (productId, color, size) => {
    try {
      const res = await cartApi.removeItem({ productId, color, size }, token);
      setCartItems(res.data.items);
      setTotalPrice(res.data.totalPrice);
      toast.info("Đã xóa sản phẩm");
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * clearCartItems
   * - Nếu itemsToRemove không truyền / mảng rỗng → xoá toàn bộ giỏ
   * - Nếu truyền mảng id (`productId-color-size`) → chỉ xoá các item đó
   */
  const clearCartItems = async (itemsToRemove) => {
    try {
      // TRƯỜNG HỢP XOÁ TOÀN BỘ GIỎ
      if (!itemsToRemove || itemsToRemove.length === 0) {
        await cartApi.clearCart(token);
        setCartItems([]);
        setTotalPrice(0);
        setSelectedItems([]);
        return;
      }

      // Tạo Set cho nhanh
      const removeSet = new Set(itemsToRemove);

      // Duyệt qua các item trong giỏ, tìm những item có id nằm trong removeSet
      for (const item of cartItems) {
        const product = item.productId;
        if (!product) continue;
        const prodId = product.id || product._id;
        const idStr = `${prodId}-${item.color}-${item.size}`;

        if (removeSet.has(idStr)) {
          await cartApi.removeItem(
            { productId: prodId, color: item.color, size: item.size },
            token
          );
        }
      }

      // Sau khi xoá, load lại giỏ từ backend
      const res = await cartApi.getCart(token);
      setCartItems(res.data.items || []);
      setTotalPrice(res.data.totalPrice || 0);

      // Cập nhật lại selectedItems (bỏ những cái đã xoá)
      setSelectedItems(prev =>
        prev.filter(id => !removeSet.has(id))
      );

    } catch (error) {
      console.error("Lỗi clearCartItems:", error);
    }
  };

  // --- LOGIC UI ---
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const toggleSelectItem = (itemIdentifier) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(itemIdentifier)
        ? prevSelected.filter(id => id !== itemIdentifier)
        : [...prevSelected, itemIdentifier]
    );
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        totalPrice, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCartItems,
        isCartOpen,
        openCart,   
        closeCart,  
        selectedItems,
        toggleSelectItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
