import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Context & API
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import orderApi from '../../api/orderApi';
import promotionApi from '../../api/promotionApi';
import addressApi from '../../api/addressApi';
import { getImageUrl } from '../../utils/imageHelper';

// Layout
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './CheckoutPage.module.scss';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, selectedItems, clearCartItems } = useCart();
  const { user, token } = useAuth();

  // --- STATE DỮ LIỆU ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);

  const [newAddress, setNewAddress] = useState({
    recipientName: user?.fullname || '',
    phoneNumber: user?.phoneNumber || '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bank'
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // LỌC ITEM ĐƯỢC CHỌN
  const checkoutItems = useMemo(
    () =>
      cartItems.filter((item) => {
        if (!item.productId) return false;
        const prodId = item.productId.id || item.productId._id;
        return selectedItems.includes(`${prodId}-${item.color}-${item.size}`);
      }),
    [cartItems, selectedItems]
  );

  // TÍNH TIỀN
  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (total, item) => total + item.productId.price * item.quantity,
        0
      ),
    [checkoutItems]
  );

  const shippingFee = subtotal >= 2000000 ? 0 : 30000;
  const total = subtotal + shippingFee - discountAmount;

  // LOAD ĐỊA CHỈ
  useEffect(() => {
    if (!token) return;

    const fetchAddresses = async () => {
      try {
        const res = await addressApi.getMyAddresses(token);
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id || defaultAddr._id);
        } else {
          setIsAddingNewAddr(true);
        }
      } catch (error) {
        console.log('Lỗi tải địa chỉ', error);
      }
    };

    fetchAddresses();
  }, [token]);

  // THÊM ĐỊA CHỈ
  const handleSaveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.phoneNumber) {
      return toast.warn('Điền đủ thông tin!');
    }
    try {
      const res = await addressApi.addAddress(newAddress, token);
      const newAddr = res.data;

      const updatedList = [newAddr, ...addresses].sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });

      setAddresses(updatedList);
      setSelectedAddressId(newAddr.id || newAddr._id);
      setIsAddingNewAddr(false);
      toast.success('Đã thêm địa chỉ');
    } catch (error) {
      toast.error('Lỗi thêm địa chỉ');
    }
  };

  // ÁP / HỦY MÃ GIẢM GIÁ
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return toast.error('Nhập mã!');
    try {
      const res = await promotionApi.checkPromotion({
        code: promoCodeInput,
        cartTotal: subtotal,
      });
      setDiscountAmount(res.data.data.discountAmount);
      setAppliedPromoCode(promoCodeInput);
      toast.success(`Giảm ${res.data.data.discountAmount.toLocaleString()}đ`);
    } catch (error) {
      setDiscountAmount(0);
      setAppliedPromoCode(null);
      toast.error(error.response?.data?.msg || 'Mã lỗi');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode(null);
    setDiscountAmount(0);
    setPromoCodeInput('');
  };

  // ĐẶT HÀNG
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // kiểm tra token
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      toast.warn('Phiên đăng nhập đã hết, vui lòng đăng nhập lại');
      navigate('/login');
      return;
    }

    if (!selectedAddressId && !isAddingNewAddr) {
      return toast.error('Chọn địa chỉ!');
    }

    if (checkoutItems.length === 0) {
      return toast.error('Không có sản phẩm nào để đặt!');
    }

    setLoading(true);
    try {
      // 1. LẤY SHIPPING INFO
      let shippingInfo = {};
      if (isAddingNewAddr) {
        shippingInfo = {
          recipientName: newAddress.recipientName,
          phoneNumber: newAddress.phoneNumber,
          address: newAddress.street,
          ward: newAddress.ward,
          district: newAddress.district,
          province: newAddress.city,
        };
      } else {
        const addr = addresses.find(
          (a) => a.id === selectedAddressId || a._id === selectedAddressId
        );
        if (!addr) throw new Error('Địa chỉ lỗi');
        shippingInfo = {
          recipientName: addr.recipientName,
          phoneNumber: addr.phoneNumber,
          address: addr.street,
          ward: addr.ward,
          district: addr.district,
          province: addr.city,
        };
      }

      // 2. CHUẨN BỊ DỮ LIỆU ORDER
      const orderItems = checkoutItems.map((item) => ({
        productId: item.productId.id || item.productId._id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        name: item.productId.productName,
        image: item.productId.img[0].url,
        price: item.productId.price,
      }));

      const orderData = {
        items: orderItems,
        shippingInfo,
        paymentMethod,
        shippingFee,
        promotionCode: discountAmount > 0 ? appliedPromoCode : null,
      };

      const itemsToDisplay = [...checkoutItems];

      // 3. NHÁNH THANH TOÁN ONLINE (bank = VNPAY)
      if (paymentMethod === 'bank') {
        const createdOrderRes = await orderApi.createOrder(orderData, authToken);
        const createdOrder = createdOrderRes.data;
        const orderCode =
          createdOrder.orderCode || createdOrder.id || createdOrder._id;

        const orderSummaryForClient = {
          orderId: orderCode,
          total,
          subtotal,
          shippingFee,
          discount: discountAmount,
          customer: {
            recipientName: shippingInfo.recipientName,
            phoneNumber: shippingInfo.phoneNumber,
            address: shippingInfo.address,
            ward: shippingInfo.ward,
            district: shippingInfo.district,
            province: shippingInfo.province,
            note: orderNote,
          },
          items: itemsToDisplay,
        };
        localStorage.setItem(
          'lastOrderData',
          JSON.stringify(orderSummaryForClient)
        );

        await clearCartItems(selectedItems);

        const payRes = await orderApi.createPaymentUrl(
          {
            amount: total,
            orderDescription: `Thanh toan don hang ${orderCode}`,
            orderCode,
            bankCode: '',
          },
          authToken
        );

        window.location.href = payRes.data.paymentUrl;
      } else {
        // 4. NHÁNH COD
        const createdOrderRes = await orderApi.createOrder(orderData, authToken);
        const createdOrder = createdOrderRes.data;
        const orderCode =
          createdOrder.orderCode || createdOrder.id || createdOrder._id;

        const orderSummaryForClient = {
          orderId: orderCode,
          total,
          subtotal,
          shippingFee,
          discount: discountAmount,
          customer: {
            recipientName: shippingInfo.recipientName,
            phoneNumber: shippingInfo.phoneNumber,
            address: shippingInfo.address,
            ward: shippingInfo.ward,
            district: shippingInfo.district,
            province: shippingInfo.province,
            note: orderNote,
          },
          items: itemsToDisplay,
        };

        // Lưu localStorage (để F5 vẫn xem được)
        localStorage.setItem(
          'lastOrderData',
          JSON.stringify(orderSummaryForClient)
        );

        // Xoá CHỈ những sản phẩm vừa đặt khỏi giỏ
        await clearCartItems(selectedItems);

        // Điều hướng sang trang chi tiết đơn hàng
        navigate('/order-success', {
          state: orderSummaryForClient,
          replace: true,
        });
      }
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      const msg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        'Đặt hàng thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  // 👉 Nếu không có sản phẩm được chọn thì hiển thị thông báo, KHÔNG redirect
  if (checkoutItems.length === 0) {
    return (
      <PageLayout pageTitle="Thanh Toán">
        <div className={styles.container}>
          <p style={{ textAlign: 'center', marginTop: 30 }}>
            Không có sản phẩm nào để thanh toán.{' '}
            <Link to="/cart" style={{ color: '#c92127', fontWeight: 600 }}>
              Quay lại giỏ hàng
            </Link>
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageTitle="Thanh Toán">
      <div className={styles.container}>
        <form onSubmit={handlePlaceOrder} className={styles.checkoutGrid}>
          {/* CỘT TRÁI */}
          <div className={styles.customerInfo}>
            {/* PHẦN ĐỊA CHỈ */}
            <div className={styles.sectionHeader}>
              <h2>Địa chỉ nhận hàng</h2>
              {!isAddingNewAddr && (
                <button
                  type="button"
                  className={styles.addAddressBtn}
                  onClick={() => setIsAddingNewAddr(true)}
                >
                  + Thêm mới
                </button>
              )}
            </div>

            {/* Form Thêm Mới */}
            {isAddingNewAddr && (
              <div className={styles.newAddressForm}>
                <div className={styles.formRow}>
                  <input
                    placeholder="Họ tên"
                    value={newAddress.recipientName}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        recipientName: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="SĐT"
                    value={newAddress.phoneNumber}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  className={styles.fullWidth}
                  placeholder="Địa chỉ (Số nhà, đường)"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                />
                <div className={styles.formRowThree}>
                  <input
                    placeholder="Phường/Xã"
                    value={newAddress.ward}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, ward: e.target.value })
                    }
                  />
                  <input
                    placeholder="Quận/Huyện"
                    value={newAddress.district}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        district: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="Tỉnh/TP"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSaveNewAddress}
                  >
                    Lưu lại
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsAddingNewAddr(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Danh Sách Địa Chỉ */}
            {!isAddingNewAddr && (
              <div className={styles.addressList}>
                {addresses.map((addr) => {
                  const addrId = addr.id || addr._id;
                  return (
                    <label
                      key={addrId}
                      className={`${styles.addressCard} ${
                        selectedAddressId === addrId ? styles.selected : ''
                      }`}
                    >
                      <div className={styles.radioCol}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addrId}
                          onChange={() => setSelectedAddressId(addrId)}
                        />
                      </div>
                      <div className={styles.infoCol}>
                        <div className={styles.nameRow}>
                          <strong>{addr.recipientName}</strong>
                          <span>| {addr.phoneNumber}</span>
                          {addr.isDefault && (
                            <span className={styles.defaultTag}>Mặc định</span>
                          )}
                        </div>
                        <p className={styles.addrText}>
                          {addr.street}, {addr.ward}, {addr.district},{' '}
                          {addr.city}
                        </p>
                      </div>
                    </label>
                  );
                })}
                {addresses.length === 0 && (
                  <p style={{ color: '#666' }}>Chưa có địa chỉ nào.</p>
                )}
              </div>
            )}

            {/* GHI CHÚ */}
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>
                Ghi chú đơn hàng
              </h3>
              <textarea
                placeholder="Ví dụ: Giao giờ hành chính..."
                className={styles.inputField}
                rows="2"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <h2 className={styles.paymentTitle}>Phương thức thanh toán</h2>
            <div className={styles.paymentOptions}>
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === 'cod' ? styles.active : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <img
                  src="/assets/images/logo.png"
                  alt="COD"
                  className={styles.paymentIcon}
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === 'bank' ? styles.active : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                />
                <img
                  src="/assets/images/vnpay.png"
                  alt="VNPAY"
                  className={styles.paymentIcon}
                />
                <span>Thanh toán qua VNPAY</span>
              </label>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className={styles.orderSummary}>
            <h2>Đơn hàng ({checkoutItems.length} sản phẩm)</h2>
            <div className={styles.summaryItems}>
              {checkoutItems.map((item, idx) => {
                const product = item.productId;
                const imageSrc =
                  product.img && product.img.length > 0
                    ? getImageUrl(product.img[0].url)
                    : '';
                return (
                  <div key={idx} className={styles.summaryItem}>
                    <img src={imageSrc} alt={product.productName} />
                    <div className={styles.itemInfo}>
                      <p>{product.productName}</p>
                      <span>
                        {item.color} / {item.size} x {item.quantity}
                      </span>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={styles.promoCode}>
              <input
                placeholder="Mã giảm giá"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
              />
              <button type="button" onClick={handleApplyPromoCode}>
                Áp dụng
              </button>
            </div>

            {appliedPromoCode && (
              <div className={styles.appliedPromo}>
                <span>
                  Đã áp dụng mã: <strong>{appliedPromoCode}</strong>
                </span>
                <button
                  type="button"
                  className={styles.removePromoBtn}
                  onClick={handleRemovePromo}
                >
                  Hủy mã
                </button>
              </div>
            )}

            <div className={styles.calculation}>
              <div className={styles.calcRow}>
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className={`${styles.calcRow} ${styles.discountRow}`}>
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className={styles.calcTotal}>
                <span>Tổng cộng</span>
                <span className={styles.totalPrice}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={styles.placeOrderButton}
              disabled={loading}
            >
              {loading
                ? 'ĐANG XỬ LÝ...'
                : paymentMethod === 'bank'
                ? 'THANH TOÁN VNPAY'
                : 'ĐẶT HÀNG'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
