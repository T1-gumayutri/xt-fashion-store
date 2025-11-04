import React from 'react';
import styles from './Footer.module.scss';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Sử dụng Link để điều hướng trong React App

// Dữ liệu cho các link liên kết
const socialLinks = [
  { icon: <FaFacebookF />, url: 'https://www.facebook.com/' },
  { icon: <FaInstagram />, url: 'https://www.instagram.com/' },
  { icon: <FaYoutube />, url: 'https://www.youtube.com/' },
  { icon: <FaTiktok />, url: 'https://www.tiktok.com/' },
];

const paymentMethods = [
  { name: 'VNPAY', icon: '/assets/images/vnpay.png' }, // Thay bằng đường dẫn ảnh thật nếu có
  
];

const companyLinks = [
  { title: 'Giới thiệu', path: '/about' },
  { title: 'Chính sách đổi trả', path: '/return-policy' },
  { title: 'Chính sách bảo mật', path: '/privacy-policy' },
  { title: 'Câu hỏi thường gặp', path: '/faq'},
  { title: 'Tuyển dụng', path: '/careers' },
  { title: 'Liên hệ', path: '/contact' },
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Cột 1: Thông tin chung */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Thời trang nam XT FASHION</h3>
          <p className={styles.description}>
            Hệ thống thời trang cho phái mạnh hàng đầu Việt Nam, hướng tới phong cách nam tính, lịch lãm và trẻ trung.
          </p>
          <div className={styles.socialIcons}>
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                {link.icon}
              </a>
            ))}
          </div>

          <h3 className={styles.subTitle}>Phương thức thanh toán</h3>
          <div className={styles.paymentMethods}>
            {paymentMethods.map((method, index) => (
              <img key={index} src={method.icon} alt={method.name} className={styles.paymentIcon} />
            ))}
          </div>
        </div>

        {/* Cột 2: Thông tin liên hệ & Vị trí cửa hàng (map) */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Thông tin liên hệ</h3>
          <p>
            <strong>Địa chỉ:</strong> 97 Man Thiện, phường Tăng Nhơn Phú, Thủ Đức, TP HCM
          </p>
          <p>
            <strong>Điện thoại:</strong> 0987654321
          </p>
          <p>
            <strong>Fax:</strong> 090463556
          </p>
          <p>
            <strong>Email:</strong> cskh@xtfashion.vn
          </p>

          <h3 className={styles.subTitle}>Vị trí cửa hàng</h3>
          <div className={styles.mapContainer}>
            {/* Đây là iframe của Google Maps, bạn có thể thay đổi link sau */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4716766488346!2d106.77209707421876!3d10.85098935799738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e0368153b%3A0x6d9f0a51c726a978!2zOTcgUGjhuqFtIEjhu5NkIFRoYWNoLCBUxINuZyBOaMahbiBQaMO6IEIsIFF14bqtbiA5LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1701358325946!5m2!1svi!2s" 
              width="100%" 
              height="150" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí cửa hàng 97 Man Thiện"
            ></iframe>
            <p className={styles.mapAddress}>97 Man Thiện, phường Tăng Nhơn Phú, Thủ Đức, TP HCM</p>
          </div>
        </div>

        {/* Cột 3: Nhóm liên kết */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Nhóm liên kết</h3>
          <ul className={styles.linksList}>
            {companyLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: Đăng ký nhận tin */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Đăng ký nhận tin</h3>
          <p className={styles.newsletterText}>
            Để cập nhật những sản phẩm mới, nhận thông tin ưu đãi đặc biệt và thông tin giảm giá khác.
          </p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Nhập email của bạn" />
            <button>ĐĂNG KÝ</button>
          </div>
          <img src="/assets/images/bo-cong-thuong.png" alt="Đã thông báo Bộ Công Thương" className={styles.bctLogo} />
        </div>
      </div>

      {/* Footer bottom */}
      <div className={styles.footerBottom}>
        <p>Copyright © 2025 XT-Fashion. Powered by Haravan</p>
      </div>
    </footer>
  );
};

export default Footer;