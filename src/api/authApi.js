import axios from 'axios';

// Base URL backend (localhost)
const API_URL = 'http://localhost:5000/api/auth';

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

//Send request for reset passwd
const forgotPassword = (email) => {
  return axios.post(`${API_URL}/forgot-password`, { email });
};

//Reset passwd
const resetPassword = (token, password) => {
  return axios.put(`${API_URL}/resetpassword/${token}`, { password });
};

const authApi = {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
};

export default authApi;