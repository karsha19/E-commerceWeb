const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts, getProductById, getRelatedProducts,
  createProduct, updateProduct, deleteProduct
} = require('../controllers/product.controller');


router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
