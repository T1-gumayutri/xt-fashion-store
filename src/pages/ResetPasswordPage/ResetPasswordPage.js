import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';

import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import BrandShowcase from '../../components/homepage/BrandShowcase/BrandShowcase';
import styles from '../LoginPage/LoginPage.module.scss';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Mật khẩu xác nhận không khớp!");
    if (password.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    
    setLoading(true);
    try {
      const response = await authApi.resetPassword(token, password);
      toast.success(response.data.msg);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Link hết hạn hoặc lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          
          <h2 className={styles.formTitle}>Đặt Lại Mật Khẩu</h2>
          <p className={styles.description}>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Mật khẩu mới" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>

        </div>
      </div>
      <BrandShowcase />
      <Footer />
    </>
  );
};

export default ResetPasswordPage;