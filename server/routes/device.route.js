const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', deviceController.getAll);
router.post('/', deviceController.create);
router.get('/:id', deviceController.getById);
router.put('/:id', deviceController.update);
router.delete('/:id', deviceController.remove);

module.exports = router;
