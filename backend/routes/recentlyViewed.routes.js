const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { recordView, getRecentlyViewed } = require('../controllers/recentlyViewed.controller');

router.use(protect);

router.get('/', getRecentlyViewed);
router.post('/:productId', recordView);

module.exports = router;
