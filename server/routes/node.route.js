const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/node.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', nodeController.getAll);
router.post('/', nodeController.create);
router.get('/me', nodeController.getNodesByCurrentUser);
router.get('/:id', nodeController.getById);
router.get('/me/:id', nodeController.getNodeByCurrentUserAndId);
router.put('/:id', nodeController.update);
router.put('/update/me/:id', nodeController.updateNodeByCurrentUser);
router.delete('/:id', nodeController.remove);
router.delete('/delete/me/:id', nodeController.deleteNodeByCurrentUser);

module.exports = router;
