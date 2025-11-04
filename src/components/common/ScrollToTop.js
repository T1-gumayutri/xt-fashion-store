import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Component này sẽ tự động cuộn lên đầu trang mỗi khi chuyển route
const ScrollToTop = () => {
  // Lấy ra pathname (ví dụ: "/", "/login", "/return-policy") từ URL hiện tại
  const { pathname } = useLocation();

  // Sử dụng useEffect để thực thi một hành động mỗi khi pathname thay đổi
  useEffect(() => {
    // Cuộn cửa sổ trình duyệt về vị trí (0, 0) - tức là lên trên cùng
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array: chỉ chạy lại effect này khi pathname thay đổi

  return null; // Component này không cần render ra bất cứ thứ gì trên giao diện
};

export default ScrollToTop;