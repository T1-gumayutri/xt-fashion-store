import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

const analyticsApi = {
  // Lấy chỉ số tổng quan (KPIs)
  getKpis: (token) => {
    return axios.get(`${API_URL}/kpis`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Lấy dữ liệu biểu đồ doanh thu
  getRevenue: (grain, token) => {
    return axios.get(`${API_URL}/revenue`, {
      params: { grain },
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Lấy Top sản phẩm bán chạy
  getTopProducts: (token) => {
    return axios.get(`${API_URL}/top-products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  // Lấy danh mục bán chạy
  getTopCategories: (token) => {
    return axios.get(`${API_URL}/top-categories`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Lấy khách hàng user hay ghé mua
  getTopCustomers: (token) => {
    return axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
    });
  }
};

export default analyticsApi;