const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, getProfile, updateProfile, changePassword
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
