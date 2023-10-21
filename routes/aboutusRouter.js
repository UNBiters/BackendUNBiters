const express = require('express');
const aboutUsController = require('./../controllers/aboutUsController');
const authController = require('./../controllers/authController');


const router = express.Router();

router.route('/')
    .get(aboutUsController.getAllUs)
    .post(aboutUsController.createUs);

router.route('/:id')
    .get(aboutUsController.getOneOfUs)
    .patch(aboutUsController.updateOneOfUs)
    .delete(aboutUsController.deleteOneOfUs);

module.exports = router;
