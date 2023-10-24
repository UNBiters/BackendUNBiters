const express = require('express');
const publicationController = require('./../controllers/publicationController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const likeRouter = require('./../routes/likeRoutes');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.use('/:publicationId/reviews', reviewRouter);
router.use('/:publicationId/likes', likeRouter);

// Busquedas filtradas:
router.route('/searchChaza').post(searchController.searchPublication);

// router.use(authController.protect);

router
    .route('/')
    .get(publicationController.getAllPublications)
    .post(
        authController.protect,
        publicationController.uploadPublicationImage,
        publicationController.resizePublicationImage,
        publicationController.setUser,
        publicationController.createPublication)


router
    .route('/updateMyPublication/:id')
    .patch(
        authController.protect,
        publicationController.uploadPublicationImage,
        publicationController.resizePublicationImage,
        publicationController.updateMyPublication);

router
    .route('/deleteMyPublication/:id')
    .delete(authController.protect,
        publicationController.deleteMyPublication);

//router.use(authController.restrictTo('admin'));

router
    .route('/:id')
    .get(publicationController.getPublication)
    .patch(authController.protect,
        publicationController.uploadPublicationImage,
        publicationController.resizePublicationImage,
        publicationController.updatePublication)
    .delete(publicationController.deletePublication);

router
    .route('/me/:id')
    .get(authController.protect, publicationController.getMePublications)


module.exports = router;
