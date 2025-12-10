import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './CartPage.module.scss';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

// 1. Import Helper xử lý ảnh
import { getImageUrl } from '../../utils/imageHelper';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, selectedItems, toggleSelectItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- 2. TÍNH TỔNG TIỀN (CHỈ TÍNH SẢN PHẨM ĐƯỢC CHỌN) ---
  const cartTotal = cartItems
    .filter(item => {
        const product = item.productId;
        if (!product) return false;
        
        // Lấy ID an toàn
        const prodId = product.id || product._id;
        const itemIdentifier = `${prodId}-${item.color}-${item.size}`;
        
        return selectedItems.includes(itemIdentifier);
    })
    .reduce((total, item) => {
        return total + (item.productId.price * item.quantity);
    }, 0);

  // --- 3. HÀM XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG ---
  const handleQuantityChange = (item, amount) => {
      const newQty = item.quantity + amount;
      if (newQty < 1) return;

      const product = item.productId;
      // Lấy ID an toàn (ưu tiên id, fallback về _id)
      const prodId = product.id || product._id;
      
      if (prodId) {
        updateQuantity(prodId, item.color, item.size, newQty);
      }
  };

  // --- 4. HÀM XỬ LÝ XÓA ---
  const handleRemove = (item) => {
      const product = item.productId;
      const prodId = product.id || product._id;

      if (prodId) {
        removeFromCart(prodId, item.color, item.size);
      }
  }

  return (
    <PageLayout pageTitle="Giỏ hàng">
      <div className={styles.cartContainer}>
        <h1>Giỏ hàng của bạn</h1>
        
        {(!cartItems || cartItems.length === 0) ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/" className={styles.continueShopping}>Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className={styles.cartGrid}>
            
            {/* --- DANH SÁCH SẢN PHẨM --- */}
            <div className={styles.cartItems}>
              {cartItems.map((item, index) => {
                // Lấy thông tin sản phẩm từ object lồng nhau
                const product = item.productId;
                
                // Nếu sản phẩm gốc bị xóa khỏi DB, product sẽ là null -> Bỏ qua
                if (!product) return null;

                // Lấy ID chuẩn để tạo key và xử lý
                const prodId = product.id || product._id;
                const itemIdentifier = `${prodId}-${item.color}-${item.size}`;
                const isSelected = selectedItems.includes(itemIdentifier);

                // Xử lý ảnh
                const imageSrc = product.img && product.img.length > 0 
                    ? getImageUrl(product.img[0].url) 
                    : 'https://via.placeholder.com/100';

                return (
                  <div key={itemIdentifier} className={styles.cartItem}>
                    {/* Checkbox chọn mua */}
                    <input 
                      type="checkbox"
                      className={styles.itemCheckbox}
                      checked={isSelected}
                      onChange={() => toggleSelectItem(itemIdentifier)}
                    />
                    
                    {/* Ảnh sản phẩm */}
                    <img 
                      src={imageSrc} 
                      alt={product.productName} 
                      onClick={() => navigate(`/product/${prodId}`)}
                      style={{cursor: 'pointer'}}
                    />

                    {/* Thông tin */}
                    <div className={styles.itemInfo}>
                      <Link to={`/product/${prodId}`} className={styles.itemName}>
                        {product.productName}
                      </Link>
                      <p className={styles.itemDetails}>
                        Màu: <strong>{item.color}</strong> / Size: <strong>{item.size}</strong>
                      </p>
                      <p className={styles.itemPrice}>{formatPrice(product.price)}</p>
                    </div>

                    {/* Bộ chỉnh số lượng */}
                    <div className={styles.itemQuantity}>
                      <button onClick={() => handleQuantityChange(item, -1)}><FiMinus /></button>
                      <input type="text" value={item.quantity} readOnly />
                      <button onClick={() => handleQuantityChange(item, 1)}><FiPlus /></button>
                    </div>

                    {/* Thành tiền từng món */}
                    <div className={styles.itemTotalPrice}>
                      {formatPrice(product.price * item.quantity)}
                    </div>

                    {/* Nút xóa */}
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

            {/* --- TỔNG KẾT ĐƠN HÀNG --- */}
            <div className={styles.cartSummary}>
              <h2>Tổng cộng</h2>
              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>Tính lúc thanh toán</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Thành tiền</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              
              {/* Chỉ cho phép thanh toán khi có tiền (đã chọn sp) */}
              {cartTotal > 0 ? (
                  <Link to="/checkout" className={styles.checkoutButton}>
                    Tiến hành thanh toán
                  </Link>
              ) : (
                  <button className={styles.checkoutButton} disabled style={{background: '#ccc', cursor: 'not-allowed'}}>
                    Vui lòng chọn sản phẩm
                  </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;