const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('usuario'),
    reviewController.setChazaUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('usuario', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('usuario', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
