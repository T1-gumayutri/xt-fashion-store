import React from 'react';
import { useCart } from '../../contexts/CartContext';
import styles from './SideCart.module.scss';
import { Link } from 'react-router-dom';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

const SideCart = () => {
  const { 
    isCartOpen, 
    closeCart, 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    selectedItems,      // <-- Lấy state
    toggleSelectItem    // <-- Lấy hàm
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const cartTotal = cartItems
    .filter(item => selectedItems.includes(`${item.id}-${item.color}-${item.size}`))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  const cartClasses = `${styles.sideCart} ${isCartOpen ? styles.open : ''}`;

  return (
    <>
      {isCartOpen && <div className={styles.overlay} onClick={closeCart}></div>}
      
      <div className={cartClasses}>
        <div className={styles.header}>
          <h3>Giỏ hàng</h3>
          <button onClick={closeCart} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn đang trống.</p>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {cartItems.map(item => {
                const itemIdentifier = `${item.id}-${item.color}-${item.size}`;
                const isSelected = selectedItems.includes(itemIdentifier);
                
                return (
                  <div key={itemIdentifier} className={styles.cartItem}>
                    {/* ▼▼▼ THÊM CHECKBOX VÀO ĐÂY ▼▼▼ */}
                    <input 
                      type="checkbox"
                      className={styles.itemCheckbox}
                      checked={isSelected}
                      onChange={() => toggleSelectItem(itemIdentifier)}
                    />
                    <img src={item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : '')} alt={item.name} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemDetails}>{item.color} / {item.size}</p>
                      <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                      <div className={styles.quantityAdjuster}>
                        <button onClick={() => updateQuantity(item.id, item.color, item.size, -1)}><FiMinus /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.color, item.size, 1)}><FiPlus /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.color, item.size)} className={styles.removeItem}>
                      <FiTrash2 />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Link to="/cart" onClick={closeCart} className={styles.viewCartButton}>
                Xem giỏ hàng
              </Link>
              <button className={styles.checkoutButton}>Thanh toán</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideCart;