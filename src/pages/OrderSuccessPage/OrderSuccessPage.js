import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './OrderSuccessPage.module.scss';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { state } = location;

  // Kiểm tra state đầy đủ
  if (!state || !state.orderId) {
    return <Navigate to="/" replace />;
  }

  // Lấy dữ liệu chi tiết hơn từ state
  const { 
    orderId, 
    total, 
    subtotal, 
    shippingFee, 
    discount, 
    customer,
    items // Lấy 'items' để hiển thị tóm tắt
  } = state;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <PageLayout pageTitle="Đặt hàng thành công">
      <div className={styles.successContainer}>
        <FaCheckCircle className={styles.successIcon} />
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn, {customer.fullName}, đã mua hàng tại <strong>XT-Fashion</strong>.</p>
        
        <div className={styles.orderDetails}>
          <p className={styles.orderIdText}>
            Mã đơn hàng của bạn là: 
            <span>{orderId}</span>
          </p>
          
          {/* Thông tin khách hàng */}
          <div className={styles.customerInfoBox}>
            <p><strong>Người nhận:</strong> {customer.fullName}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Điện thoại:</strong> {customer.phone}</p>
            <p><strong>Giao đến:</strong> {customer.address}</p>
          </div>

          {/* --- TÓM TẮT SẢN PHẨM --- */}
          <div className={styles.summaryItems}>
            {items && items.map(item => (
              <div key={`${item.id}-${item.color}-${item.size}`} className={styles.summaryItem}>
                <img src={item.imageUrl || item.images[0]} alt={item.name} />
                <div className={styles.itemInfo}>
                  <p>{item.name}</p>
                  <span>{item.color} / {item.size} x {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* --- TÓM TẮT THANH TOÁN --- */}
          <div className={styles.calculation}>
            <div className={styles.calcRow}>
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.calcRow}>
              <span>Phí vận chuyển</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.calcRow} ${styles.discountRow}`}>
                <span>Giảm giá</span>
                <span>- {formatPrice(discount)}</span>
              </div>
            )}
            <div className={styles.calcTotal}>
              <span>Tổng cộng</span>
              <span className={styles.totalPrice}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <Link to="/" className={styles.continueButton}>
          Tiếp tục mua sắm
        </Link>
        {/* Thêm link đến trang profile/quản lý đơn hàng */}
        <Link to="/profile" className={styles.trackOrderButton}>
          Theo dõi đơn hàng
        </Link>
      </div>
    </PageLayout>
  );
};

export default OrderSuccessPage;