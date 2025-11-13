const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');

// Các route quản lý user cần xác thực
router.use(auth);
router.get('/', userController.getAll);
router.post('/', userController.create);
router.get('/get/me', userController.getCurrentUser);
router.get('/:id', userController.getById);
router.put('/update/me', userController.updateCurrentUser);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
