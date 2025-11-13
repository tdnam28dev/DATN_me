const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/node.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', nodeController.getAll);
router.post('/', nodeController.create);
router.get('/:id', nodeController.getById);
router.put('/:id', nodeController.update);
router.delete('/:id', nodeController.remove);

module.exports = router;
