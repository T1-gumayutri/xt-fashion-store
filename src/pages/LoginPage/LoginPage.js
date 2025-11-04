import React, { useState } from 'react';
import styles from './LoginPage.module.scss';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm/RegisterForm';
// --- IMPORT THE BANNER COMPONENT ---
import BrandShowcase from '../../components/homepage/BrandShowcase/BrandShowcase';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <>
      <Header />
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <div className={styles.tabHeader}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'login' ? styles.active : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
      {/* --- ADD THE BANNER HERE, ABOVE THE FOOTER --- */}
      <BrandShowcase />
      <Footer />
    </>
  );
};

export default LoginPage;