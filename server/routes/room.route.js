const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', roomController.getAll);
router.post('/', roomController.create);
router.get('/me', roomController.getRoomsByCurrentUser);
router.get('/me/:id', roomController.getRoomsByCurrentUserAndHome);
router.get('/:id', roomController.getById);
router.put('/update/me/:id', roomController.updateRoomByCurrentUser);
router.put('/:id', roomController.update);
router.delete('/delete/me/:id', roomController.deleteRoomByCurrentUser);
router.delete('/:id', roomController.remove);

module.exports = router;
