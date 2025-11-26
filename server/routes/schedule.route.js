const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', scheduleController.getAll);
router.post('/', scheduleController.create);
router.get('/me', scheduleController.getSchedulesByCurrentUser);
router.get('/:id', scheduleController.getById);
router.get('/me/:id', scheduleController.getScheduleByCurrentUserAndId);
router.put('/:id', scheduleController.update);
router.put('/update/me/:id', scheduleController.updateScheduleByCurrentUser);
router.delete('/:id', scheduleController.remove);
router.delete('/delete/me/:id', scheduleController.deleteScheduleByCurrentUser);

module.exports = router;
