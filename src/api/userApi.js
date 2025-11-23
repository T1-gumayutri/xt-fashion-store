import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

//---Profile---
//getme lay thong tin ca nhan
const getMe = (token) => {
  return axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//update inf
const updateMe = (token, userData) => {
  return axios.put(`${API_URL}/me`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//update passwd
const changePassword = (token, passwordData) => {
  return axios.put(`${API_URL}/me/password`, passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//---Admin---
//Get all users;
const getAllUsers = (token) => {
  return axios.get(`${API_URL}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//Get user by id
const getUserById = (token, userId) => {
  return axios.get(`${API_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Admin update user;
const updateUserById = (token, userId, data) => {
  return axios.put(`${API_URL}/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//Del user forever;
const deleteUserById = (token, userId) => {
  return axios.delete(`${API_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const userApi = {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};

export default userApi;