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
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Cập nhật lại selectedItems để chỉ bao gồm những item còn trong giỏ hàng
    // (Quan trọng khi clearCartItems được gọi)
    setSelectedItems(prevSelected => {
      const currentItemIds = cartItems.map(item => `${item.id}-${item.color}-${item.size}`);
      return prevSelected.filter(id => currentItemIds.includes(id));
    });

  }, [cartItems]);

  // --- HÀM MỚI ĐỂ XÓA CÁC SẢN PHẨM ĐÃ CHỌN ---
  const clearCartItems = (itemsToClear) => { // itemsToClear là mảng các ID đã chọn
    setCartItems(prevItems => 
      prevItems.filter(item => {
        const itemIdentifier = `${item.id}-${item.color}-${item.size}`;
        return !itemsToClear.includes(itemIdentifier);
      })
    );
    // Sau khi xóa khỏi giỏ hàng, cũng xóa khỏi danh sách "đã chọn"
    setSelectedItems(prevSelected => 
      prevSelected.filter(id => !itemsToClear.includes(id))
    );
  };
  // ---------------------------------------------


  // Tự động chọn tất cả khi mới load
  useEffect(() => {
    setSelectedItems(cartItems.map(item => `${item.id}-${item.color}-${item.size}`));
  }, []); // Chỉ chạy 1 lần khi load

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const toggleSelectItem = (itemIdentifier) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(itemIdentifier)
        ? prevSelected.filter(id => id !== itemIdentifier)
        : [...prevSelected, itemIdentifier]
    );
  };

  const addToCart = (product, selectedColor, selectedSize, quantity) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        item.color === selectedColor.color && 
        item.size === selectedSize
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.color === selectedColor.color && item.size === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Khi thêm sản phẩm mới, tự động chọn nó
        const newItemIdentifier = `${product.id}-${selectedColor.color}-${selectedSize}`;
        setSelectedItems(prevSelected => [...prevSelected, newItemIdentifier]);
        
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
    // Khi xóa, cũng bỏ chọn nó
    const itemIdentifier = `${productId}-${color}-${size}`;
    setSelectedItems(prevSelected => prevSelected.filter(id => id !== itemIdentifier));
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
        isCartOpen,
        openCart,   
        closeCart,  
        selectedItems,
        toggleSelectItem,
        clearCartItems // <-- Thêm hàm mới vào context
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};