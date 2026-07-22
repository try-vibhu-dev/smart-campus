const express = require('express');
const router = express.Router();
const {
  register, login, testEmail,
  forgotPassword, resetPassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/test-email', testEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;