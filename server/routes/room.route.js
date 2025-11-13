const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', roomController.getAll);
router.post('/', roomController.create);
router.get('/:id', roomController.getById);
router.put('/:id', roomController.update);
router.delete('/:id', roomController.remove);

module.exports = router;
