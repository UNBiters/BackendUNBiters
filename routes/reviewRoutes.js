const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    reviewController.setPublicationUserIds,
    reviewController.createReview
  );

router
  .get('/myReviews', reviewController.getMyReviews)

router
  .route('/:id')
  .get(reviewController.getReviews)
  .patch(
    authController.restrictTo('admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin'),
    reviewController.deleteReview
  );

module.exports = router;
