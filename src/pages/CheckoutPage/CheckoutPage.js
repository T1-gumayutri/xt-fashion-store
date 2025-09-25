import React, { useState, useMemo } from 'react';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './CheckoutPage.module.scss';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, selectedItems } = useCart();
  const [promoCode, setPromoCode] = useState('');

  // Lọc ra các sản phẩm đã được chọn để thanh toán
  const itemsToCheckout = useMemo(() => 
    cartItems.filter(item => selectedItems.includes(`${item.id}-${item.color}-${item.size}`))
  , [cartItems, selectedItems]);

  const subtotal = useMemo(() => 
    itemsToCheckout.reduce((total, item) => total + (item.price * item.quantity), 0)
  , [itemsToCheckout]);
  
  // Logic tính phí vận chuyển
  const shippingFee = subtotal > 2000000 ? 0 : 30000; // Miễn phí nếu > 2 triệu, ngược lại là 30k

  const total = subtotal + shippingFee; // (Chưa tính khuyến mãi)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <PageLayout pageTitle="Thanh toán">
      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutGrid}>
          {/* Cột bên trái: Thông tin khách hàng */}
          <div className={styles.customerInfo}>
            <h2>Thông tin giao hàng</h2>
            <input type="text" placeholder="Họ và tên" className={styles.inputField} />
            <input type="email" placeholder="Email" className={styles.inputField} />
            <input type="tel" placeholder="Số điện thoại" className={styles.inputField} />
            <input type="text" placeholder="Địa chỉ" className={styles.inputField} />
            <textarea placeholder="Ghi chú (tùy chọn)" className={styles.inputField}></textarea>
          </div>

          {/* Cột bên phải: Tóm tắt đơn hàng */}
          <div className={styles.orderSummary}>
            <h2>Đơn hàng của bạn</h2>
            <div className={styles.summaryItems}>
              {itemsToCheckout.map(item => (
                <div key={`${item.id}-${item.color}-${item.size}`} className={styles.summaryItem}>
                  <img src={item.imageUrl || item.images[0]} alt={item.name} />
                  <div className={styles.itemInfo}>
                    <p>{item.name}</p>
                    <span>Số lượng: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className={styles.promoCode}>
              <input 
                type="text" 
                placeholder="Mã giảm giá" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button>Áp dụng</button>
            </div>
            <div className={styles.calculation}>
              <div className={styles.calcRow}>
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              <div className={styles.calcTotal}>
                <span>Tổng cộng</span>
                <span className={styles.totalPrice}>{formatPrice(total)}</span>
              </div>
            </div>
            <button className={styles.placeOrderButton}>Hoàn tất đơn hàng</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;