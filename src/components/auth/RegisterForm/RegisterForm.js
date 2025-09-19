import React, { useState } from 'react';
import styles from '../LoginForm/LoginForm.module.scss'; 
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import authApi from '../../../api/authApi'; // <-- IMPORT API SERVICE

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // To show success/error messages
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.register(name, email, phone, password);
      setMessage(response.data.msg);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className={styles.form}>
      {/* ... input fields for name, email, phone, password ... */}
      <div className={styles.inputGroup}>
        <FiUser className={styles.inputIcon} />
        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className={styles.inputGroup}>
        <FiMail className={styles.inputIcon} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className={styles.inputGroup}>
        <FiPhone className={styles.inputIcon} />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className={styles.inputGroup}>
        <FiLock className={styles.inputIcon} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      
      {message && <div className={styles.message}>{message}</div>}
      
      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
};

export default RegisterForm;