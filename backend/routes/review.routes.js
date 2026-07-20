const express = require('express');
const router = express.Router({ mergeParams: true }); // access :productId from parent mount
const { protect } = require('../middleware/auth');
const { getReviews, addReview, deleteReview } = require('../controllers/review.controller');

router.get('/', getReviews);
router.post('/', protect, addReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
