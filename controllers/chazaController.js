const Chaza = require('./../models/chazaModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.chazasPubli = (req, res, next) => {
    req.query.sort = '-ratingsAverage';
    req.query.fields = 'etiquetas,nombre,slogan,logo,ratingsAverage,banner,comentarios';
    next();
  };

exports.getChaza = factory.getOne(Chaza, { path: 'reviews' });
exports.getAllChazas = factory.getAll(Chaza);
exports.createChaza = factory.createOne(Chaza, true);

// Do NOT update passwords with this!
exports.updateChaza = factory.updateOne(Chaza);
exports.deleteChaza = factory.deleteOne(Chaza);