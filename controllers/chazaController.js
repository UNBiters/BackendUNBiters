const Chaza = require('./../models/chazaModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.chazasPubli = (req, res, next) => {
    req.query.sort = '-ratingsAverage';
    req.query.fields = 'etiquetas,nombre,slogan,logo,ratingsAverage,banner,comentarios';
    next();
  };

exports.setUserChaza = (req, res, next) => {
  if (!req.body.propietarios) req.body.propietarios = req.user.id;
  next();
}

// Debe haber ingresado al perfil de la chaza y alli se encontra el boton de follow
exports.followChaza = catchAsync(async (req, res, next) => {
  const chaza = await Chaza.findOne({ _id: req.params.id });
  let followChaza;
  if (chaza.seguidores.includes(req.user.id)) {
      // Si el usuario ya es seguidor, lo eliminamos y reducimos numSeguidores en 1
      followChaza = await Chaza.findOneAndUpdate(
          { _id: req.params.id },
          {
              $pull: { seguidores: req.user.id },
              $inc: { numSeguidores: -1 }
          },
          { new: true }
      );
  } else {
      // Si el usuario no es seguidor, lo añadimos y aumentamos numSeguidores en 1
      followChaza = await Chaza.findOneAndUpdate(
          { _id: req.params.id },
          {
              $push: { seguidores: req.user.id },
              $inc: { numSeguidores: 1 }
          },
          { new: true }
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        followChaza
      }
    });
})

exports.getChaza = factory.getOne(Chaza, { path: 'reviews' });
exports.getAllChazas = factory.getAll(Chaza);
exports.createChaza = factory.createOne(Chaza, true);

// Do NOT update passwords with this!
exports.updateChaza = factory.updateOne(Chaza);
exports.deleteChaza = factory.deleteOne(Chaza);

exports.getMyChaza = catchAsync(async(req, res, next) => {
  const myChaza = await Chaza.findOne({propietarios: req.user.id})
  if (!myChaza) {
    return next(
      new AppError(
        'No se encontro la chaza asociada a este usuario!',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      myChaza
    }
  });
});