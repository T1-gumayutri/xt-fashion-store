import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
// --- BƯỚC 1: XÓA IMPORT BREADCRUMB VÌ KHÔNG DÙNG NỮA ---
// import Breadcrumb from '../../common/Breadcrumb/Breadcrumb'; 
import styles from './ProfilePage.module.scss';
import { FiUser, FiShoppingCart, FiKey, FiLogOut, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';

import userApi from '../../api/userApi';

const ProfilePage = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'password'
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

  // Tải thông tin người dùng vào form khi component được mount
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  // Handler khi submit form thông tin
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token'); // Lấy token
      if (!token) return;

      // Gọi API
      const response = await userApi.updateMe(token, formData);

      // API trả về user mới, ta cập nhật lại vào Context để UI hiển thị đúng ngay lập tức
      // Lưu ý: login ở đây đóng vai trò là "setUser"
      login(response.data, token); 

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
      const token = localStorage.getItem('token');
      
      await userApi.changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Đổi mật khẩu thành công!');
      
      // Reset form
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
          <div>
            <h2>Lịch sử đơn hàng</h2>
            <p className={styles.placeholder}>
              Bạn chưa có đơn hàng nào.
              {/* (Tính năng này sẽ được phát triển sau) */}
            </p>
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
                    placeholder='Tối thiểu 6 ký tự'
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
    // --- BƯỚC 2: TRUYỀN "pageTitle" CHO PAGELAYOUT ---
    // PageLayout sẽ tự tạo breadcrumb "Trang chủ / Tài khoản"
    <PageLayout pageTitle="Tài khoản"> 
      
      {/* --- BƯỚC 3: XÓA BREADCRUMB THỨ HAI BỊ TRÙNG --- */}
      {/* <Breadcrumb paths={[{ name: 'Trang chủ', link: '/' }, { name: 'Tài khoản' }]} /> */}
      
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