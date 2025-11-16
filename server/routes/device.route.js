const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', deviceController.getAll);
router.get('/me', deviceController.getDevicesByCurrentUser);
router.post('/', deviceController.create);
router.get('/me/:id', deviceController.getDeviceByCurrentUserAndId);
router.get('/:id', deviceController.getById);
router.put('/update/me/:id', deviceController.updateDeviceByCurrentUser);
router.put('/:id', deviceController.update);
router.delete('/delete/me/:id', deviceController.deleteDeviceByCurrentUser);
router.delete('/:id', deviceController.remove);

module.exports = router;
