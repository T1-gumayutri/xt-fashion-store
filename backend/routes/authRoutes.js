const express = require('express');
const router = express.Router();

const { register, login, googleLogin, forgotPassword, resetPassword } = require('../controllers/authController');


//POST /api/auth/register
router.post('/register', register);

//POST /api/auth/login
router.post('/login', login);

//POST /api/auth/google
router.post('/google', googleLogin);

// API POST Send email
router.post('/forgot-password', forgotPassword);

// API PUT reset passwd
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;