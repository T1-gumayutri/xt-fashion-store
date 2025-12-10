const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', addressController.getMyAddresses);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;