const Chaza = require('./../models/chazaModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getChaza = factory.getOne(Chaza);
exports.getAllChazas = factory.getAll(Chaza);

// Do NOT update passwords with this!
exports.updateChaza = factory.updateOne(Chaza);
exports.deleteChaza = factory.deleteOne(Chaza);