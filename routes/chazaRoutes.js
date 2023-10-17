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

router
  .route('/')
  .get(chazaController.getAllChazas)
  .post(chazaController.createChaza);

router
  .route('/:id')
  .get(chazaController.getChaza)
  .patch(chazaController.updateChaza)
  .delete(chazaController.deleteChaza);

module.exports = router;