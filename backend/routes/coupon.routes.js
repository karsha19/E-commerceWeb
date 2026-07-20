const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon
} = require('../controllers/coupon.controller');

router.use(protect);

router.post('/validate', validateCoupon); // any logged-in user, used at checkout

router.get('/', adminOnly, getCoupons);
router.post('/', adminOnly, createCoupon);
router.put('/:id', adminOnly, updateCoupon);
router.delete('/:id', adminOnly, deleteCoupon);

module.exports = router;
