const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Đăng ký và đăng nhập không cần xác thực
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;