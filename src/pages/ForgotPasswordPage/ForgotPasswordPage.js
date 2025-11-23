import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';

import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import BrandShowcase from '../../components/homepage/BrandShowcase/BrandShowcase';
import styles from '../LoginPage/LoginPage.module.scss'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      toast.success(response.data.msg);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Lỗi gửi yêu cầu.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          
          <h2 className={styles.formTitle}>Quên Mật Khẩu</h2>
          
          <p className={styles.description}>
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>

          <div className={styles.backLinkContainer}>
            <Link to="/login" className={styles.backLink}>
              &larr; Quay lại Đăng nhập
            </Link>
          </div>

        </div>
      </div>
      <BrandShowcase />
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;