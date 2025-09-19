import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, selectedColor, selectedSize, quantity) => {
    setCartItems(prevItems => {
      // Kiểm tra xem sản phẩm với cùng màu và size đã có trong giỏ chưa
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        item.color === selectedColor.color && 
        item.size === selectedSize
      );

      if (existingItem) {
        // Nếu đã có, chỉ cập nhật số lượng
        return prevItems.map(item =>
          item.id === product.id && item.color === selectedColor.color && item.size === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Nếu chưa có, thêm mới vào giỏ hàng
        return [...prevItems, { 
          ...product, 
          color: selectedColor.color,
          size: selectedSize,
          quantity 
        }];
      }
    });
  };

  const removeFromCart = (productId, color, size) => {
    setCartItems(prevItems => prevItems.filter(item => 
      !(item.id === productId && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (productId, color, size, amount) => {
    setCartItems(prevItems => prevItems.map(item =>
      item.id === productId && item.color === color && item.size === size
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    ));
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        isCartOpen, // <-- Thêm vào context
        openCart,   // <-- Thêm vào context
        closeCart   // <-- Thêm vào context
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};