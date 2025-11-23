import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

// --- USER ---
const createOrder = (data, token) => {
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Lấy lịch sử đơn hàng của tôi
const getMyOrders = (token) => {
  return axios.get(`${API_URL}/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Xem chi tiết 1 đơn hàng
const getOrderById = (id, token) => {
  return axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- ADMIN ---
// Lấy tất cả đơn hàng
const getAllOrders = (token) => {
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cập nhật trạng thái
const updateStatus = (id, data, token) => {
  return axios.put(`${API_URL}/${id}/status`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const orderApi = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateStatus,
};

export default orderApi;