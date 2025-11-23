import axios from 'axios';

const API_URL = 'http://localhost:5000/api/carts';

// Lấy giỏ hàng
const getCart = (token) => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Thêm vào giỏ
const addToCart = (data, token) => {
  return axios.post(`${API_URL}/add`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cập nhật số lượng
const updateItem = (data, token) => {
  return axios.put(`${API_URL}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Xóa 1 sản phẩm
const removeItem = (data, token) => {
  return axios.delete(`${API_URL}/remove`, {
    headers: { Authorization: `Bearer ${token}` },
    data: data, // Axios yêu cầu body của delete nằm trong key 'data'
  });
};

// Xóa empty--
const clearCart = (token) => {
  return axios.delete(`${API_URL}/clear`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const cartApi = {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  clearCart,
};

export default cartApi;