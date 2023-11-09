const Chaza = require('./../models/chazaModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');
const path = require('path');

const multerStorage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: path.join( "/tmp"),
  filename: function (req, file, cb) {
    cb(null, `publication-${req.user.id}-${Date.now()}.jpeg`);
  },
});
const multerFilter = (req, file, cb) => {
  console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('El archivo no es una imagen! Por favor sube una imagen', 400), false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: multerFilter
});

exports.uploadChazaImages = upload.fields([
  {name: 'logo', maxCount: 1},
  {name: 'fotos', maxCount: 3},
  {name: 'banner', maxCount: 1},
]);

// upload.single('image') req.file
// upload.array('images') req.files

exports.resizeChazaImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.fotos && !req.files.banner && !req.files.logo && !req.files.imagenes) {
    return next()
  }
  // Puede que un usuario tenga varias chazas.
  const myChaza = await Chaza.findById(req.params.id);
 
  if (!myChaza) {
    return next(new AppError('No se encontro una chaza asociada a este usuario', 404));
  }

  // Logos:
  if (req.files.logo) {
    req.body.logo = `chaza-${myChaza.id}-${Date.now()}-logo.jpeg` 

    await sharp(req.files.logo[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/chazas/${req.body.logo}`);
  }
  
  // Fotos:
  if (req.files.fotos) {
    // console.log("ENTROOOOOOOOOOOOOOo")
    req.body.fotos = []
    await Promise.all(req.files.fotos.map(async (file, i) => {
      const filename = `chaza-${myChaza.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/chazas/${filename}`);

      req.body.fotos.push(filename)
    }));
  }
  
  // Banner: 
  if (req.files.banner) {
    req.body.banner = `chaza-${myChaza.id}-${Date.now()}-banner.jpeg` 

    await sharp(req.files.banner[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/chazas/${req.body.banner}`);
    }
  next()
});


exports.updateMyChaza = catchAsync(async (req, res, next) => {
  console.log(req.body)
  // El siguiente código reemplaza las imagenes que se encuentren en los campos de imagenes y borra todas las anteriores que se tenian.
  const updatedChaza = await Chaza.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

  if (!updatedChaza) {
    return next(new AppError('No se encontro una chaza asociada a este usuario', 404));
  }

  if (req.body.nombre) {
    updatedChaza.slug = slugify(req.body.nombre, { lower: true });
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedChaza
    }
  });
});

exports.deleteMyChaza = catchAsync(async (req, res, next) => {
  const deletedChaza = await Chaza.findByIdAndDelete(req.params.id);
  if (!deletedChaza) {
    return next(new AppError('No se encontro una chaza asociada a este usuario', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});


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

exports.getChaza = factory.getOne(Chaza, { path: 'publications' });
exports.getAllChazas = factory.getAll(Chaza);
exports.getAllChazasNames = factory.getAllNames(Chaza);
exports.createChaza = factory.createOne(Chaza, true);

// Do NOT update passwords with this!
exports.updateChaza = factory.updateOne(Chaza);
exports.deleteChaza = factory.deleteOne(Chaza);

exports.getMyChazas = catchAsync(async(req, res, next) => {
  const myChaza = await Chaza.find({propietarios: req.user.id})
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