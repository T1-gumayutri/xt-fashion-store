import axios from 'axios';

// Base URL backend (localhost)
const API_URL = 'http://localhost:5000/api/users';

// Đăng ký tài khoản
const register = (fullname, email, phoneNumber, password) => {
  return axios.post(`${API_URL}/register`, {
    fullname,
    email,
    phoneNumber,
    password,
  });
};

// Đăng nhập
const login = (email, password) => {
  return axios.post(`${API_URL}/login`, {
    email,
    password,
  });
};

// Đăng nhập bằng Google
const googleLogin = (googleToken) => {
  return axios.post(`${API_URL}/google`, {
    token: googleToken,
  });
};

// Lấy thông tin user hiện tại (khi đã có token)
const getMe = (token) => {
  return axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const authApi = {
  register,
  login,
  googleLogin,
  getMe,
};

export default authApi;
