import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

// --- PUBLIC ---
const getAll = (params) => {
  return axios.get(API_URL, { params });
};

const getById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

//--admin---
const create = (data, token) => {
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const update = (id, data, token) => {
  return axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const remove = (id, token) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const productApi = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default productApi;