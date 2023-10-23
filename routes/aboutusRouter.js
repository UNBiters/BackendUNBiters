const express = require('express');
const aboutUsController = require('./../controllers/aboutUsController');
const authController = require('./../controllers/authController');


const router = express.Router();

router.use(authController.protect)
router.use(authController.restrictTo('admin'))
router.route('/')
    .get(aboutUsController.getAllUs)
    .post(
        aboutUsController.uploadAboutusImage,
        aboutUsController.resizeAboutusImage,
        aboutUsController.createUs);

router.route('/:id')
    .get(aboutUsController.getOneOfUs)
    .patch(aboutUsController.updateOneOfUs)
    .delete(aboutUsController.deleteOneOfUs);

module.exports = router;
