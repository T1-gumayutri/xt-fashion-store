import React from 'react';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './CartPage.module.scss';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <PageLayout pageTitle="Giỏ hàng của bạn">
      <div className={styles.cartContainer}>
        <h1>Giỏ hàng</h1>
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/" className={styles.continueShopping}>Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className={styles.cartGrid}>
            <div className={styles.cartItems}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <img src={item.imageUrl} alt={item.name} />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemDetails}>Màu: {item.color} / Size: {item.size}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>
                  <div className={styles.itemQuantity}>
                    <button onClick={() => updateQuantity(item.id, item.color, item.size, -1)}><FiMinus /></button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item.id, item.color, item.size, 1)}><FiPlus /></button>
                  </div>
                  <div className={styles.itemTotalPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.color, item.size)} className={styles.removeItem}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.cartSummary}>
              <h2>Tổng cộng</h2>
              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Thành tiền</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <button className={styles.checkoutButton}>Tiến hành thanh toán</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;