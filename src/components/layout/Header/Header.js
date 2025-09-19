import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Header.module.scss';
import logo from '../../../assets/images/logo.png';
import { FiUser, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { slugify } from '../../../helpers/slugify';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';

// Dữ liệu cấu hình menu
const menuItems = [
  // ... các mục menu khác
  {
    title: 'Áo xuân hè',
    path: '/ao-xuan-he',
    subMenu: [
      { title: 'Áo Sơ Mi Dài Tay' }, // Chỉ cần title, path sẽ được tạo tự động
      { title: 'Áo Sơ Mi Ngắn Tay' },
      { title: 'Áo Polo' },
      { title: 'Áo Thun' },
      { title: 'Áo Khoác' },
    ],
  },
  {
    title: 'Quần',
    path: '/quan',
    subMenu: [
      { title: 'Quần Dài' },
      { title: 'Quần Short' },
    ],
  },
  {
    title: 'Phụ kiện',
    path: '/phu-kien',
    subMenu: [
      { title: 'Bóp Tay / Ví' },
      { title: 'Giày' },
      { title: 'Thắt Lưng' },
      { title: 'Cà Vạt' },
    ],
  },
  { title: 'Khuyến mãi', path: '/khuyen-mai' },
  { title: 'Thông tin', path: '/thong-tin' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, openCart } = useCart();
  const { wishlist, openWishlist } = useWishlist();
  const navigate = useNavigate();
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        {/* SỬA LỖI: Tách riêng phần đăng nhập và các nút chức năng */}
        <div className={styles.userActions}>
          {user ? (
            <>
              <span className={styles.welcomeMessage}>Xin chào, {user.name}</span>
              <span>|</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.topLink}>
              <FiUser className={styles.icon} aria-hidden="true" /> Tài khoản
            </Link>
          )}
        </div>

        {/* Các nút Giỏ hàng và Yêu thích luôn hiển thị */}
        <div className={styles.customerActions}>
          <button onClick={openWishlist} className={styles.topLink}>
            <FiHeart className={styles.icon} /> Yêu thích
            {wishlist.length > 0 && <span className={styles.cartCount}>{wishlist.length}</span>}
          </button>
          <span>|</span>
          <button onClick={openCart} className={styles.topLink}>
            <FiShoppingCart className={styles.icon} aria-hidden="true" /> Giỏ hàng
            {totalItemsInCart > 0 && <span className={styles.cartCount}>{totalItemsInCart}</span>}
          </button>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.logo}>
          <Link to="/"><img src={logo} alt="Atino" /></Link>
        </div>

        <nav className={styles.navigation}>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className={styles.navItem}>
                <Link to={item.path}>{item.title}</Link>
                {item.subMenu && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownContent}>
                      {item.subMenu.map((subItem, subIndex) => (
                        <Link key={subIndex} to={`/collections/${slugify(subItem.title)}`}>
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;