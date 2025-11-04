import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Nhà cung cấp) - Component này sẽ bao bọc toàn bộ ứng dụng
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // useEffect này sẽ chạy một lần khi ứng dụng khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Hàm để xử lý đăng nhập
  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  // Hàm để xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Tạo một custom hook để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};