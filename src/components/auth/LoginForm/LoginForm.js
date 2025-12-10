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
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password, rememberMe);
      const { user, token } = response.data;

      login(user, token, rememberMe);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {

      if (!error.response) {
        setMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
      } else {
        const errorMsg = error.response?.data?.msg || "Đăng nhập thất bại. Vui lòng thử lại.";
        setMessage(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await authApi.googleLogin(credentialResponse.credential);
      const { user, token } = response.data;

      login(user, token, true);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Google Login Error:", error);
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
        <input 
          type="email" 
          placeholder="Email hoặc Tên đăng nhập" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          autoComplete="username" 
        />
      </div>
      <div className={styles.inputGroup}>
        <FiLock className={styles.inputIcon} />
        <input 
          type="password" 
          placeholder="Mật khẩu" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          autoComplete="current-password"
        />
      </div>
      
      <div className={styles.options}>
        <label className={styles.rememberMe}>
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Ghi nhớ</span>
        </label>
        <a href="/forgot-password" className={styles.forgotPassword}>Quên mật khẩu?</a>
      </div>
      
      {message && <div className={styles.message} role="alert">{message}</div>}
      
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
          width="100%" 
          theme="outline"
        />
      </div>
    </form>
  );
};

export default LoginForm;