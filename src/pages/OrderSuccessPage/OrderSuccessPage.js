// src/pages/OrderSuccessPage/OrderSuccessPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './OrderSuccessPage.module.scss';
import { FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageHelper';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    price
  );

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(() => location.state || null);
  const hasShownToastRef = useRef(false);

  // Lấy dữ liệu từ localStorage nếu F5 / flow VNPAY quay về mà không có state
  useEffect(() => {
    if (orderData) return;

    const saved = localStorage.getItem('lastOrderData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrderData(parsed);
      } catch (e) {
        console.error('Parse lastOrderData error', e);
        navigate('/', { replace: true });
      }
    } else {
      navigate('/', { replace: true });
    }
  }, [orderData, navigate]);

  // Toast "Đặt hàng thành công"
  useEffect(() => {
    if (!orderData || hasShownToastRef.current) return;

    const { orderId, total } = orderData;
    toast.success(
      `Đặt hàng thành công! Mã: ${orderId} - Tổng thanh toán: ${formatPrice(
        total
      )}`,
      { autoClose: 5000 }
    );
    hasShownToastRef.current = true;
  }, [orderData]);

  // Đang load / đang redirect
  if (!orderData) {
    return null;
  }

  const { orderId, total, subtotal, shippingFee, discount, customer, items } =
    orderData;

  return (
    <PageLayout pageTitle="Đặt hàng thành công">
      <div className={styles.successContainer}>
        <FaCheckCircle className={styles.successIcon} />
        <h1>Đặt hàng thành công!</h1>

        <p>
          Cảm ơn bạn đã mua hàng tại <strong>XT-Fashion</strong>.
        </p>

        <div className={styles.orderDetails}>
          <p className={styles.orderIdText}>
            Mã đơn hàng của bạn là:
            <span>{orderId}</span>
          </p>

          <div className={styles.customerInfoBox}>
            <h3>Thông tin nhận hàng</h3>
            <p>
              <strong>Người nhận:</strong> {customer.recipientName}
            </p>
            <p>
              <strong>Điện thoại:</strong> {customer.phoneNumber}
            </p>
            <p>
              <strong>Giao đến:</strong>{' '}
              {`${customer.address}, ${customer.ward}, ${customer.district}, ${customer.province}`}
            </p>
            {customer.note && (
              <p>
                <strong>Ghi chú đơn hàng:</strong> {customer.note}
              </p>
            )}
          </div>

          <div className={styles.orderInfoBox}>
            <h3>Thông tin đơn hàng</h3>
            <p>
              <strong>Mã đơn hàng:</strong> {orderId}
            </p>
            <p>
              <strong>Tạm tính:</strong> {formatPrice(subtotal)}
            </p>
            <p>
              <strong>Phí vận chuyển:</strong>{' '}
              {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
            </p>
            {discount > 0 && (
              <p>
                <strong>Giảm giá:</strong> - {formatPrice(discount)}
              </p>
            )}
            <p>
              <strong>Tổng thanh toán:</strong> {formatPrice(total)}
            </p>
          </div>

          {/* Danh sách sản phẩm */}
          <div className={styles.summaryItems}>
            {items &&
              items.map((item, index) => {
                const product = item.productId || {};
                const imageSrc =
                  product.img && product.img.length > 0
                    ? getImageUrl(product.img[0].url)
                    : item.image
                    ? getImageUrl(item.image)
                    : '';

                const key = `${product.id || product._id || index}-${
                  item.color
                }-${item.size}`;

                return (
                  <div key={key} className={styles.summaryItem}>
                    <img src={imageSrc} alt={product.productName || item.name} />
                    <div className={styles.itemInfo}>
                      <p>{product.productName || item.name}</p>
                      <span>
                        {item.color} / {item.size} x {item.quantity}
                      </span>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatPrice(
                        (product.price || item.price || 0) * item.quantity
                      )}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className={styles.calculation}>
            <div className={styles.calcRow}>
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.calcRow}>
              <span>Phí vận chuyển</span>
              <span>
                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className={`${styles.calcRow} ${styles.discountRow}`}>
                <span>Giảm giá</span>
                <span>- {formatPrice(discount)}</span>
              </div>
            )}
            <div className={styles.calcTotal}>
              <span>Tổng cộng</span>
              <span className={styles.totalPrice}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/" className={styles.continueButton}>
            Tiếp tục mua sắm
          </Link>
          <Link to="/profile" className={styles.trackOrderButton}>
            Theo dõi đơn hàng
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderSuccessPage;
