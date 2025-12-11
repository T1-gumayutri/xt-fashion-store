import axios from 'axios';

// Đảm bảo URL này đúng với server của bạn
const API_URL = 'http://localhost:5000/api/analytics';

const analyticsApi = {
  // 1. KPI Tổng quan
  getKpis: (token) => {
    return axios.get(`${API_URL}/kpis`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 2. Biểu đồ doanh thu
  getRevenue: (params, token) => {
    return axios.get(`${API_URL}/revenue`, {
      params: params, // { type, from, to }
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 3. Top sản phẩm
  getTopProducts: (token) => {
    return axios.get(`${API_URL}/top-products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 4. Phân tích danh mục (Pie Chart)
  getCategoryAnalytics: (token) => {
    return axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 5. Trạng thái đơn hàng (Donut Chart)
  getOrderStatusAnalytics: (token) => {
    return axios.get(`${API_URL}/order-status`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 6. Top khách hàng VIP
  getTopCustomers: (token) => {
    return axios.get(`${API_URL}/top-customers`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 7. Cảnh báo tồn kho
  getLowStock: (token) => {
    return axios.get(`${API_URL}/low-stock`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  }
};

export default analyticsApi;