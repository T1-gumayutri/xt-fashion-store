import axios from 'axios';

const API_URL = 'http://localhost:5000/api/addresses';

const addressApi = {
  getMyAddresses: (token) => {
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  addAddress: (data, token) => {
    return axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateAddress: (id, data, token) => {
    return axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteAddress: (id, token) => {
    return axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default addressApi;