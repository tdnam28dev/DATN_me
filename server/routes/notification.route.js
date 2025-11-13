const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', notificationController.getAll);
router.post('/', notificationController.create);
router.get('/:id', notificationController.getById);
router.put('/:id', notificationController.update);
router.delete('/:id', notificationController.remove);

module.exports = router;
