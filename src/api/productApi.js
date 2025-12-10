import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

// --- PUBLIC ---
const getAll = (params) => {
  return axios.get(API_URL, { params });
};

const getById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};


//PHAN REVIEW: GET /api/products/:id/reviews
const getReviews = (id) => {
  return axios.get(`${API_URL}/${id}/reviews`);
};

// POST /api/products/:id/reviews
const addReview = (id, data, token) => {
  return axios.post(`${API_URL}/${id}/reviews`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

// GET /api/products/admin/all-reviews
const getAllReviewsAdmin = (token) => {
    return axios.get(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// DELETE /api/products/admin/reviews/:reviewId
const deleteReviewAdmin = (reviewId, token) => {
    return axios.delete(`${API_URL}/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// PUT /api/products/admin/reviews/:reviewId/status
const updateReviewStatus = (reviewId, status, token) => {
    return axios.put(`${API_URL}/admin/reviews/${reviewId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const productApi = {
  getAll,
  getById,
  getReviews,
  addReview,
  create,
  update,
  remove,
  getAllReviewsAdmin,
  deleteReviewAdmin,
  updateReviewStatus,
};

export default productApi;