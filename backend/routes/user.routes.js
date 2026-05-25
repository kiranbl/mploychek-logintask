const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const { getUsers, createUser, updateUser, deleteUser, getProfile } = require('../controllers/user.controller');

router.get('/profile', authMiddleware, getProfile);
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.post('/', authMiddleware, adminMiddleware, createUser);
router.patch('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;