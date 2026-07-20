const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/user.controller');

router.use(protect, adminOnly); // all user management routes are admin-only

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
