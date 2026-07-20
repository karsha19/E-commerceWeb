const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  placeOrder, getMyOrders, getOrderById, downloadInvoice,
  getAllOrders, updateOrderStatus, getSalesAnalytics
} = require('../controllers/order.controller');

router.use(protect); // all order routes require login

// Admin routes (declared before /:id so they aren't swallowed by the param route)
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/admin/analytics', adminOnly, getSalesAnalytics);
router.put('/:id/status', adminOnly, updateOrderStatus);

// Customer routes
router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
