const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', scheduleController.getAll);
router.post('/', scheduleController.create);
router.get('/:id', scheduleController.getById);
router.put('/:id', scheduleController.update);
router.delete('/:id', scheduleController.remove);

module.exports = router;
