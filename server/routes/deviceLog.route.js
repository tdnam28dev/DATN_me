const express = require('express');
const router = express.Router();
const deviceLogController = require('../controllers/deviceLog.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', deviceLogController.getAll);
router.post('/', deviceLogController.create);
router.get('/:id', deviceLogController.getById);
router.delete('/:id', deviceLogController.remove);

module.exports = router;
