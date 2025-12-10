import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import styles from './ProfilePage.module.scss';
import { 
  FiUser, 
  FiShoppingCart, 
  FiKey, 
  FiLogOut, 
  FiMail, 
  FiPhone 
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import userApi from '../../api/userApi';
import orderApi from '../../api/orderApi';
import { getImageUrl } from '../../utils/imageHelper';

const ProfilePage = () => {
  const { user, logout, login, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  // State cho form thông tin
  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
  });

  // State cho form đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // STATE LỊCH SỬ ĐƠN HÀNG
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Tải thông tin người dùng vào form khi component được mount
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  // LẤY LỊCH SỬ ĐƠN HÀNG KHI MỞ TAB "orders"
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab !== 'orders') return;
      if (!token) return;

      setOrdersLoading(true);
      try {
        const res = await orderApi.getMyOrders(token);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Không tải được lịch sử đơn hàng');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, token]);

  // Handler khi submit form thông tin
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tokenLocal = localStorage.getItem('token'); 
      if (!tokenLocal) return;

      const response = await userApi.updateMe(tokenLocal, formData);
      // cập nhật lại context
      login(response.data, tokenLocal); 

      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handler khi submit form đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const tokenLocal = localStorage.getItem('token');
      await userApi.changePassword(tokenLocal, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Đổi mật khẩu thất bại';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // FORMAT GIÁ & DATE
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('vi-VN');

  // --- TEXT TRẠNG THÁI ĐƠN (BÊN PHẢI) ---
  const renderStatusText = (order) => {
    if (order.paymentMethod === 'bank' && !order.isPaid) {
      return 'Chờ thanh toán';
    }
    switch (order.status) {
      case 'pending':    return 'Đang xử lý';
      case 'processing': return 'Đang chuẩn bị hàng';
      case 'shipped':    return 'Đang giao';
      case 'delivered':  return 'Đã giao';
      case 'cancelled':  return 'Đã huỷ';
      default:           return order.status || 'Không rõ';
    }
  };

  const statusClass = (order) => {
    if (order.status === 'cancelled') return styles.cancelled;
    if (order.status === 'delivered') return styles.delivered;
    if (order.paymentMethod === 'bank' && !order.isPaid) return styles.pending;
    if (order.status === 'shipped' || order.status === 'processing') return styles.processing;
    return styles.pending;
  };

  // --- TEXT TRẠNG THÁI THANH TOÁN ---
  const renderPaymentText = (order) => {
    if (order.paymentMethod !== 'bank') {
      return order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
    }

    // VNPAY, dùng paymentStatus
    switch (order.paymentStatus) {
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'expired':
        return 'Thanh toán hết hạn';
      case 'unpaid':
      default:
        return 'Chưa thanh toán';
    }
  };

  // Cho phép thanh toán lại?
  const canPayNow = (order) => {
    return (
      order.paymentMethod === 'bank' &&
      (order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed') &&
      order.status === 'pending'
    );
  };

  // NÚT "THANH TOÁN NGAY" → GỌI VNPAY LẠI
  const handlePayOrder = async (order) => {
    try {
      if (!token) {
        toast.warn('Vui lòng đăng nhập lại');
        return;
      }

      const orderCode = order.orderCode || order._id;
      if (!orderCode) {
        toast.error('Không tìm thấy mã đơn hàng để thanh toán');
        return;
      }

      const res = await orderApi.createPaymentUrl(
        {
          orderCode,
          bankCode: '', 
        },
        token
      );

      window.location.href = res.data.paymentUrl;
    } catch (err) {
      console.error(err);
      toast.error('Không tạo được link thanh toán');
    }
  };

  // Render nội dung dựa trên tab đang active
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className={styles.formContainer}>
            <h2>Thông tin tài khoản</h2>
            <form onSubmit={handleInfoSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputWithIcon}>
                  <FiMail />
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="fullname">Họ và tên</label>
                <div className={styles.inputWithIcon}>
                  <FiUser />
                  <input
                    type="text"
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Số điện thoại</label>
                <div className={styles.inputWithIcon}>
                  <FiPhone />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        );

      case 'orders':
        return (
          <div className={styles.ordersContainer}>
            <h2>Lịch sử đơn hàng</h2>

            {ordersLoading ? (
              <p>Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrder}>
                <p>Bạn chưa có đơn hàng nào.</p>
                <button onClick={() => navigate('/')}>Mua sắm ngay</button>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <div key={order._id} className={styles.orderCard}>
                    {/* HEADER */}
                    <div className={styles.orderHeader}>
                      <div className={styles.orderId}>
                        Mã đơn: <strong>{order.orderCode || order._id}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#777' }}>
                          Ngày đặt: {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className={`${styles.status} ${statusClass(order)}`}>
                        {renderStatusText(order)}
                      </div>
                    </div>

                    {/* BODY */}
                    <div className={styles.orderBody}>
                      <div className={styles.orderInfo}>
                        <p>
                          Phương thức:{' '}
                          <strong>
                            {order.paymentMethod === 'bank' ? 'VNPAY' : 'COD'}
                          </strong>
                        </p>
                        <p>
                          Thanh toán:{' '}
                          <strong>{renderPaymentText(order)}</strong>
                        </p>
                        <p className={styles.total}>
                          Tổng: {formatPrice(order.total)}
                        </p>
                      </div>

                      {canPayNow(order) && (
                        <button
                          type="button"
                          onClick={() => handlePayOrder(order)}
                          className={styles.payNowButton}
                        >
                          Thanh toán ngay
                        </button>
                      )}
                    </div>

                    {/* LIST SẢN PHẨM TRONG ĐƠN */}
                    {order.items && order.items.length > 0 && (
                      <div className={styles.orderItems}>
                        {order.items.map((item) => {
                          const imgSrc = item.image
                            ? getImageUrl(item.image)
                            : '/assets/images/placeholder.png';
                          return (
                            <div
                              key={`${item.productId}-${item.color}-${item.size}`}
                              className={styles.orderItem}
                            >
                              <img
                                src={imgSrc}
                                alt={item.name}
                                className={styles.orderItemImage}
                              />
                              <div className={styles.orderItemInfo}>
                                <p>{item.name}</p>
                                <span>
                                  {item.color} / {item.size} x {item.quantity}
                                </span>
                              </div>
                              <div className={styles.orderItemPrice}>
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div className={styles.formContainer}>
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Mật khẩu cũ</label>
                <div className={styles.inputWithIcon}>
                  <FiKey />
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <div className={styles.inputWithIcon}>
                  <FiKey />
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <div className={styles.inputWithIcon}>
                  <FiKey />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout pageTitle="Tài khoản">
      <div className={styles.profilePage}>
        <nav className={styles.sidebar}>
          <div className={styles.welcome}>
            <FiUser size={24} />
            <span>Xin chào,</span>
            <strong>{user?.fullname || 'Khách'}</strong>
          </div>
          <ul>
            <li
              className={activeTab === 'info' ? styles.active : ''}
              onClick={() => setActiveTab('info')}
            >
              <FiUser /> Thông tin tài khoản
            </li>
            <li
              className={activeTab === 'orders' ? styles.active : ''}
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingCart /> Lịch sử đơn hàng
            </li>
            <li
              className={activeTab === 'password' ? styles.active : ''}
              onClick={() => setActiveTab('password')}
            >
              <FiKey /> Đổi mật khẩu
            </li>
            <li className={styles.logout} onClick={handleLogout}>
              <FiLogOut /> Đăng xuất
            </li>
          </ul>
        </nav>
        <main className={styles.content}>
          {renderContent()}
        </main>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
