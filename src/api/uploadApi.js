import axios from 'axios';

const API_URL = 'http://localhost:5000/api/upload';

const uploadImages = (formData, token) => {
  return axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

const uploadApi = {
  uploadImages,
};

export default uploadApi;