import axios from 'axios';

const API_URL = 'http://localhost:5000/api/wishlist';

const wishlistApi = {
  // GET /api/wishlist
  getWishlist: (token) => {
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // POST /api/wishlist/add
  addToWishlist: (productId, token) => {
    return axios.post(`${API_URL}/add`, 
      { productId }, // Body
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // DELETE /api/wishlist/remove/:id
  removeFromWishlist: (productId, token) => {
    return axios.delete(`${API_URL}/remove/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default wishlistApi;