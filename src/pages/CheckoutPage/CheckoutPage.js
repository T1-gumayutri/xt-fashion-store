import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './CheckoutPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { promotions } from '../../data/mockData'; // Import khuyến mãi

const CheckoutPage = () => {
  const { cartItems, selectedItems, clearCartItems } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // State cho khuyến mãi
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // Lưu trữ TOÀN BỘ object promo đã áp dụng
  const [discountAmount, setDiscountAmount] = useState(0); // Chỉ lưu số tiền giảm (fixed/percent)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Lọc sản phẩm
  const itemsToCheckout = useMemo(() => 
    cartItems.filter(item => selectedItems.includes(`${item.id}-${item.color}-${item.size}`))
  , [cartItems, selectedItems]);

  // Tính Tạm tính
  const subtotal = useMemo(() => 
    itemsToCheckout.reduce((total, item) => total + (item.price * item.quantity), 0)
  , [itemsToCheckout]);
  
  // --- CẬP NHẬT LOGIC TÍNH PHÍ VẬN CHUYỂN ---
  const shippingFee = useMemo(() => {
    // 1. Kiểm tra nếu có mã freeship được áp dụng
    if (appliedPromo && appliedPromo.type === 'shipping') {
      return 0; // Miễn phí
    }
    // 2. Kiểm tra điều kiện freeship mặc định (đơn > 2 triệu)
    if (subtotal >= 2000000 || subtotal === 0) {
      return 0; // Miễn phí
    }
    // 3. Mặc định 30k
    return 30000;
  }, [subtotal, appliedPromo]); // Phụ thuộc vào tạm tính và mã KM
  
  // Tính Tổng cộng
  const total = useMemo(() => {
    // Tổng = Tạm tính + Phí ship (đã tính KM) - Tiền giảm giá (đã tính KM)
    const calculatedTotal = subtotal + shippingFee - discountAmount;
    return Math.max(0, calculatedTotal);
  }, [subtotal, shippingFee, discountAmount]);

  // Tự động kiểm tra lại mã KM nếu giỏ hàng thay đổi
  useEffect(() => {
    if (appliedPromo && subtotal < appliedPromo.minOrderValue) {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoCodeInput('');
      toast.info('Mã khuyến mãi đã bị gỡ do không đủ điều kiện.');
    }
    // Tự động tính lại discount nếu là mã %
    else if (appliedPromo && appliedPromo.type === 'percent') {
      let discount = subtotal * (appliedPromo.value / 100);
      if (appliedPromo.maxValue && discount > appliedPromo.maxValue) {
        discount = appliedPromo.maxValue;
      }
      setDiscountAmount(Math.min(discount, subtotal));
    }

  }, [subtotal, appliedPromo]); // Chỉ phụ thuộc subtotal và appliedPromo

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // --- HÀM ÁP DỤNG MÃ (CẬP NHẬT) ---
  const handleApplyPromoCode = () => {
    if (appliedPromo) return;

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    const promo = promotions.find(p => p.code.toUpperCase() === code);

    if (!promo) {
      toast.error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      return;
    }

    // Kiểm tra điều kiện đơn hàng tối thiểu
    if (subtotal < promo.minOrderValue) {
      toast.warn(`Đơn hàng phải từ ${formatPrice(promo.minOrderValue)} để áp dụng mã này.`);
      return;
    }

    // --- XỬ LÝ TÙY LOẠI MÃ ---
    if (promo.type === 'fixed') {
      const discount = Math.min(promo.value, subtotal);
      setDiscountAmount(discount);
      setAppliedPromo(promo);
      toast.success(`Áp dụng mã giảm ${formatPrice(discount)} thành công!`);
    } 
    else if (promo.type === 'percent') {
      let discount = subtotal * (promo.value / 100);
      if (promo.maxValue && discount > promo.maxValue) {
        discount = promo.maxValue;
      }
      discount = Math.min(discount, subtotal);
      
      setDiscountAmount(discount);
      setAppliedPromo(promo);
      toast.success(`Áp dụng mã giảm ${formatPrice(discount)} thành công!`);
    } 
    else if (promo.type === 'shipping') {
      // Chỉ cần set mã, shippingFee useMemo sẽ tự động tính lại
      setDiscountAmount(0); // Mã ship không giảm tiền
      setAppliedPromo(promo);
      toast.success('Áp dụng mã miễn phí vận chuyển thành công!');
    }
  };

  // --- HÀM GỠ MÃ (CẬP NHẬT) ---
  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setDiscountAmount(0); // Reset cả tiền giảm
    setPromoCodeInput('');
    toast.info('Đã gỡ mã khuyến mãi.');
  };
  // -------------------------------

  const validateForm = () => {
    // ... (Không thay đổi)
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng!');
      return;
    }
    if (itemsToCheckout.length === 0) {
      toast.error('Không có sản phẩm nào để thanh toán!');
      navigate('/cart');
      return;
    }

    const mockOrderId = `XT-${Date.now().toString().slice(-6)}`;
    
    clearCartItems(selectedItems);
    
    toast.success('Đặt hàng thành công!');
    // Truyền dữ liệu chi tiết sang trang thành công
    navigate('/order-success', { 
      state: { 
        orderId: mockOrderId,
        total: total, // Tổng tiền cuối cùng
        subtotal: subtotal, // Tạm tính
        shippingFee: shippingFee, // Phí ship (đã tính KM)
        discount: discountAmount, // Tiền giảm (chỉ tiền)
        appliedPromoCode: appliedPromo ? appliedPromo.code : null,
        items: itemsToCheckout,
        customer: formData
      }, 
      replace: true 
    });
  };

  return (
    <PageLayout pageTitle="Thanh toán">
      <div className={styles.checkoutContainer}>
        <form onSubmit={handleSubmitOrder} className={styles.checkoutGrid} noValidate>
          {/* Cột bên trái: Thông tin khách hàng (Không thay đổi) */}
          <div className={styles.customerInfo}>
            {/* ... (Giữ nguyên input họ tên, email, sđt, địa chỉ, ghi chú) ... */}
            <h2>Thông tin giao hàng</h2>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                name="fullName"
                placeholder="Họ và tên" 
                className={`${styles.inputField} ${errors.fullName ? styles.inputError : ''}`}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <input 
                type="tel" 
                name="phone"
                placeholder="Số điện thoại" 
                className={`${styles.inputField} ${errors.phone ? styles.inputError : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
            </div>

            <div className={styles.inputGroup}>
              <input 
                type="text" 
                name="address"
                placeholder="Địa chỉ" 
                className={`${styles.inputField} ${errors.address ? styles.inputError : ''}`}
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
            </div>
            
            <textarea 
              name="note"
              placeholder="Ghi chú (tùy chọn)" 
              className={styles.inputField}
              value={formData.note}
              onChange={handleChange}
            ></textarea>
            
            {/* Phương thức thanh toán (Không thay đổi) */}
            <h2 className={styles.paymentTitle}>Phương thức thanh toán</h2>
            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <img src="/assets/images/logo.png" alt="COD" className={styles.paymentIcon} />
                Thanh toán khi nhận hàng (COD)
              </label>
              <label className={styles.paymentOption}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="vnpay" 
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                 <img src="/assets/images/vnpay.png" alt="VNPAY" className={styles.paymentIcon} />
                Thanh toán qua VNPAY
              </label>
            </div>
          </div>

          {/* Cột bên phải: Tóm tắt đơn hàng (Không thay đổi UI) */}
          <div className={styles.orderSummary}>
            <h2>Đơn hàng của bạn ({itemsToCheckout.length} sản phẩm)</h2>
            {/* ... (Phần map sản phẩm) ... */}
            <div className={styles.summaryItems}>
              {itemsToCheckout.length > 0 ? (
                itemsToCheckout.map(item => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className={styles.summaryItem}>
                    <img src={item.imageUrl || item.images[0]} alt={item.name} />
                    <div className={styles.itemInfo}>
                      <p>{item.name}</p>
                      <span>Màu: {item.color} / Size: {item.size}</span>
                      <span>Số lượng: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>
                  Không có sản phẩm nào. 
                  <Link to="/"> Quay lại mua sắm</Link>
                </p>
              )}
            </div>

            {itemsToCheckout.length > 0 && (
              <>
                {/* Phần khuyến mãi (Không thay đổi UI) */}
                {!appliedPromo ? (
                  <div className={styles.promoCode}>
                    <input 
                      type="text" 
                      placeholder="Mã giảm giá" 
                      value={promoCodeInput} 
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                    />
                    <button type="button" onClick={handleApplyPromoCode}>Áp dụng</button>
                  </div>
                ) : (
                  <div className={styles.appliedPromo}>
                    <span>Mã áp dụng: <strong>{appliedPromo.code}</strong></span>
                    <button type="button" onClick={handleRemovePromoCode} className={styles.removePromoBtn}>Xóa</button>
                  </div>
                )}
                
                {/* Phần tính toán (UI KHÔNG ĐỔI, nhưng logic đã đúng) */}
                <div className={styles.calculation}>
                  <div className={styles.calcRow}>
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Phí vận chuyển</span>
                    {/* Biến shippingFee giờ đã tự động là 0 nếu có KM */}
                    <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                  </div>

                  {/* Chỉ hiển thị khi có giảm giá (fixed/percent) */}
                  {discountAmount > 0 && (
                    <div className={`${styles.calcRow} ${styles.discountRow}`}>
                      <span>Giảm giá</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className={styles.calcTotal}>
                    <span>Tổng cộng</span>
                    <span className={styles.totalPrice}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button type="submit" className={styles.placeOrderButton}>
                  {paymentMethod === 'cod' ? 'Hoàn tất đơn hàng' : 'Thanh toán VNPAY'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;