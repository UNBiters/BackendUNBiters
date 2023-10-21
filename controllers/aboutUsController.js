const factory = require('./handlerFactory');
const AboutUs = require('./../models/aboutUsModel');

exports.getAllUs = factory.getAll(AboutUs);
exports.createUs = factory.createOne(AboutUs);
exports.getOneOfUs = factory.getOne(AboutUs);
exports.updateOneOfUs = factory.updateOne(AboutUs);
exports.deleteOneOfUs = factory.deleteOne(AboutUs);