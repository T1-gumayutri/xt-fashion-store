import axios from 'axios';

// The base URL for our backend API
const API_URL = 'http://localhost:5000/api/auth';

const register = (name, email, phone, password) => {
  return axios.post(`${API_URL}/register`, {
    name,
    email,
    phone,
    password,
  });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, {
    email,
    password,
  });
};

const googleLogin = (googleToken) => {
  // Gửi token nhận được từ Google về backend
  return axios.post(`${API_URL}/google`, {
    token: googleToken,
  });
};

const authApi = {
  register,
  login,
  googleLogin,
};

export default authApi;