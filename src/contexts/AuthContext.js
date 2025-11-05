import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import axios from "axios";

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Chạy một lần khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);

      // 👇 Gắn token mặc định cho axios
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${storedToken}`;
    }

    setLoading(false); // 👈 báo là đã load xong
  }, []);

  // Hàm xử lý đăng nhập
  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    setUser(userData);
    setToken(userToken);

    // 👇 Gắn token cho mọi request axios
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${userToken}`;
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);

    // 👇 Xóa header Authorization
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading }} // 👈 expose loading
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
