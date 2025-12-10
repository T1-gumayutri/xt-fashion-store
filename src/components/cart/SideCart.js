import React from 'react';
import { useCart } from '../../contexts/CartContext';
import styles from './SideCart.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const SideCart = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Tính tổng tiền (Dựa trên giá mới nhất từ productId)
  const cartTotal = cartItems.reduce((total, item) => {
      if (!item.productId) return total;
      return total + (item.productId.price * item.quantity);
  }, 0);

  const cartClasses = `${styles.sideCart} ${isCartOpen ? styles.open : ''}`;

  // Hàm xử lý thay đổi số lượng
  const handleUpdateQty = (item, amount) => {
    const product = item.productId;
    if (!product) return;
    
    // Lấy ID an toàn
    const prodId = product.id || product._id;
    const newQty = item.quantity + amount;

    if (newQty > 0) {
        updateQuantity(prodId, item.color, item.size, newQty);
    }
  };

  // Hàm xử lý xóa
  const handleRemove = (item) => {
    const product = item.productId;
    if (!product) return;
    
    const prodId = product.id || product._id;
    removeFromCart(prodId, item.color, item.size);
  };

  return (
    <>
      {isCartOpen && <div className={styles.overlay} onClick={closeCart}></div>}
      
      <div className={cartClasses}>
        <div className={styles.header}>
          <h3>Giỏ hàng ({cartItems.length})</h3>
          <button onClick={closeCart} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {(!cartItems || cartItems.length === 0) ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn đang trống.</p>
            <button onClick={closeCart} className={styles.continueBtn}>Tiếp tục mua sắm</button>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {cartItems.map((item) => {
                const product = item.productId;
                
                if (!product) return null; 

                const imageSrc = product.img && product.img.length > 0 
                    ? getImageUrl(product.img[0].url) 
                    : '';
                
                const prodId = product.id || product._id;
                const key = `${prodId}-${item.color}-${item.size}`;

                return (
                  <div key={key} className={styles.cartItem}>
                    <img 
                        src={imageSrc} 
                        alt={product.productName} 
                        onClick={() => {
                            closeCart();
                            navigate(`/product/${prodId}`);
                        }}
                        style={{cursor: 'pointer'}}
                    />
                    
                    <div className={styles.itemInfo}>
                      <Link 
                        to={`/product/${prodId}`} 
                        className={styles.itemName}
                        onClick={closeCart}
                      >
                          {product.productName}
                      </Link>
                      
                      <p className={styles.itemDetails}>{item.color} / {item.size}</p>
                      
                      <p className={styles.itemPrice}>{formatPrice(product.price)}</p>
                      
                      <div className={styles.quantityAdjuster}>
                        {/* Nút Giảm */}
                        <button onClick={() => handleUpdateQty(item, -1)}>
                            <FiMinus />
                        </button>
                        
                        <span>{item.quantity}</span>
                        
                        {/* Nút Tăng */}
                        <button onClick={() => handleUpdateQty(item, 1)}>
                            <FiPlus />
                        </button>
                      </div>
                    </div>

                    {/* Nút Xóa */}
                    <button 
                        onClick={() => handleRemove(item)} 
                        className={styles.removeItem}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Tạm tính:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Link to="/cart" onClick={closeCart} className={styles.viewCartButton}>
                Xem giỏ hàng chi tiết
              </Link>
              <Link to="/checkout" onClick={closeCart} className={styles.checkoutButton}>
                Thanh toán ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideCart;