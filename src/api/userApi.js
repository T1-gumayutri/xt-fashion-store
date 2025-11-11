
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getUsers = () => {
  return axios.get(`${API_URL}/users`);
};

const userApi = { getUsers };
export default userApi;
