const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.post('/', homeController.createHome);
router.get('/', homeController.getHomes);
router.get('/me', homeController.getHomesByCurrentUser);
router.get('/:id', homeController.getHomeById);
router.put('/:id', homeController.updateHome);
router.put('/update/me/:id', homeController.updateHomeByCurrentUser);
router.delete('/:id', homeController.deleteHome);
router.delete('/delete/me/:id', homeController.deleteHomeByCurrentUser);

module.exports = router;
