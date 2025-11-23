import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import axios from "axios";
import userApi from "../api/userApi";

// Tạo Context
const AuthContext = createContext();

// Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Hàm Login
  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    setUser(userData);
    setToken(userToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
  };

  // Hàm Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setToken(storedToken);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        try {
          const response = await userApi.getMe(storedToken);
          
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          console.log("Phiên đăng nhập hết hạn hoặc lỗi:", error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading }} 
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};