const express = require('express');
const likeController = require('../controllers/likeController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// Los usuarios deben estar logeados.
router.use(authController.protect);

router
  .route('/')
  .get(likeController.getAllLikes)
  .post(authController.restrictTo('usuario'), likeController.setChazaUserIds, likeController.upsert);

router
  .route('/:id')
  .get(likeController.getLike);


module.exports = router;

