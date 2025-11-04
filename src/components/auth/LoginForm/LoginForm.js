import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import authApi from '../../../api/authApi';
import styles from './LoginForm.module.scss';
import { FiUser, FiLock } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.user, response.data.token);
      navigate('/'); 
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Đã có lỗi xảy ra.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
      // Gửi token của Google về backend của bạn để xác thực
      const response = await authApi.googleLogin(credentialResponse.credential);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setMessage("Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setMessage("Quá trình đăng nhập Google đã bị hủy.");
  };

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <div className={styles.inputGroup}>
        <FiUser className={styles.inputIcon} />
        <input type="email" placeholder="Email hoặc Tên đăng nhập" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className={styles.inputGroup}>
        <FiLock className={styles.inputIcon} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      
      <div className={styles.options}>
        <label className={styles.rememberMe}><input type="checkbox" /><span>Ghi nhớ</span></label>
        <a href="/forgot-password" className={styles.forgotPassword}>Quên mật khẩu?</a>
      </div>
      
      {message && <div className={styles.message}>{message}</div>}
      
      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      <div className={styles.separator}>
        <span>hoặc</span>
      </div>

      <div className={styles.socialLoginContainer}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
          useOneTap
        />
      </div>
    </form>
  );
};

export default LoginForm;