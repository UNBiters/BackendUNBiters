const express = require('express');
const chazaController = require('./../controllers/chazaController');
const authController = require('./../controllers/authController');
const searchController = require('../controllers/searchController');
const reviewRouter = require('./../routes/reviewRoutes');
const likeRouter = require('./likeRoutes');

const router = express.Router();

router.use('/:chazaId/reviews', reviewRouter);
router.use('/:chazaId/likes', likeRouter);

// Hacer delete me, update me poner restriccion de administradores. 

// Busquedas filtradas:
router.route('/searchChaza').post(searchController.searchChaza);

// Publicaciones:
router.route('/publi-chazas').get(chazaController.chazasPubli, chazaController.getAllChazas);

// Mi perfil de chaza:
router.route('/mychaza').get(authController.protect, authController.restrictTo('chazaUser'), chazaController.getMyChaza)

router
  .route('/')
  .get(chazaController.getAllChazas)
  .post(authController.protect, authController.restrictTo('admin', 'chazaUser'), chazaController.setUserChaza, chazaController.createChaza);

router
  .route('/:id')
  .get(chazaController.getChaza)
  .post(authController.protect, chazaController.followChaza)
  .patch(authController.protect, authController.restrictTo('admin'), chazaController.updateChaza)
  .delete(authController.protect, authController.restrictTo('admin'), chazaController.deleteChaza);

module.exports = router;