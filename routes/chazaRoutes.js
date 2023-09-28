const express = require('express');
const chazaController = require('./../controllers/chazaController');

const router = express.Router();

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