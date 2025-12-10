import axios from 'axios';

const API_URL = 'http://localhost:5000/api/promotions';

const promotionApi = {
  getActivePromotions: () => {
    return axios.get(`${API_URL}/active`);
  },

  checkPromotion: (data) => {
    return axios.post(`${API_URL}/check`, data);
  },

  //--admin--
  getAll: (token) => {
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  create: (data, token) => {
    return axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  update: (id, data, token) => {
    return axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  remove: (id, token) => {
    return axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default promotionApi;