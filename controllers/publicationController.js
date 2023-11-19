const Publication = require('./../models/publicationModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const slugify = require('slugify');
const Chaza = require('../models/chazaModel');
const searchController = require('./searchController');

const path = require('path');
const multerStorage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: path.join("/tmp"),
  filename: function (req, file, cb) {
    cb(null, `publication-${req.user.id}-${Date.now()}.jpeg`);
  },
});
const multerFilter = (req, file, cb) => {
  // console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('El archivo no es una imagen! Por favor sube una imagen', 400), false);
  }
};

exports.resizePublicationImage = catchAsync(async (req, res, next) => {
  /*if (!req.file) return next();

  req.file.filename = `publication-${req.user.id}-${Date.now()}.jpeg`;
  req.file.path = path.join(__dirname, 'public/img/publications/' + req.file.filename);

  await sharp(req.file.buffer)
    .resize(700, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/publications/${req.file.filename}`);
*/
  next();
});

const upload = multer({
  storage: storage,
  fileFilter: multerFilter
});

exports.uploadPublicationImage = upload.single('imagen');

exports.setUser = (req, res, next) => {
  // Allow nested routes
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllPublications = factory.getAll(Publication, { path: 'reviews' });
exports.getPublication = factory.getOne(Publication, { path: 'reviews' });
exports.getMePublications = factory.getOnes(Publication, "chaza", { path: 'reviews' });
exports.createPublication = factory.createOne(Publication, true);
exports.updatePublication = factory.updateOne(Publication);
exports.deletePublication = factory.deleteOne(Publication);

exports.updateMyPublication = catchAsync(async (req, res, next) => {

  const filteredBody = {
    user: req.user.id,
    texto: req.body.texto,
    nombreChaza: req.body.nombreChaza,
    rating: req.body.rating,
    chaza: req.body.chaza,
    tags: req.body.tags
  }

  //if (req.file) filteredBody.imagen = req.file.filename;
  if (req.file && Model.modelName == "Publication") {
    const result = await cloudinary.v2.uploader.upload(req.file.path)
    //console.log(result)
    req.body.imagenUrl = result.secure_url;
    req.body.imagenId = result.public_id;
    await fs.unlink(req.file.path)
  }

  const currentPublication = await Publication.findOne({ _id: req.params.id, user: req.user.id });
  const updatedPublication = await Publication.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, filteredBody, {
    runValidators: true
  });
  
  if (!currentPublication) {
    return next(new AppError("No se encontro la publicación buscada por este usuario", 404));
  }
  await searchController.updateDocuments("Publication", req.params.id, req.body);


  const slug = slugify(currentPublication.nombreChaza, {lower: true});
  if (slug != updatedPublication.slug) {
    await Chaza.findOneAndUpdate({ slug }, { $inc: { numPublications: -1 } })
    // await Chaza.findOneAndUpdate({ slug: updatedPublication.slug }, { $inc: { numPublications: 1 } } )
  }



  res.status(200).json({
    status: 'success',
    data: {
      publication: updatedPublication
    }
  });
});

exports.deleteMyPublication = catchAsync(async (req, res, next) => {
  const deletedPublication = await Publication.findOneAndDelete({ _id:req.params.id, user: req.user.id });
  if (!deletedPublication) {
    return next(new AppError('No se encontro una publicación asociada a este usuario', 404));
  }
  await searchController.deleteDocuments("Publication", req.params.id);


  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMyPublications = catchAsync(async (req, res, next) => {
  const publications = await Publication.find({ user: req.user.id }).populate({ path: 'reviews' });
  res.status(200).json({
    status: 'success',
    data: {
      publications
    }
  });
});

exports.sexPubliStats = catchAsync(async (req, res, next) => {
  if (req.user.nivelSuscripcion == 0) return next(new AppError("Si deseas ver estadisticas de tus chazas, por favor adquiere el plan especial", 403));
  const misChazas = await Chaza.find({ propietarios: req.user.id }).populate({ path: 'publications' });

  if (!misChazas.length) {
      return next(new AppError('No se encontraron chazas para este usuario.', 404));
  }

  const conteoChazas = [];

  misChazas.forEach(chaza => {
      const conteoPorSexo = { "M": 0, "F": 0, "Otro": 0 };
      
      chaza.publications.forEach(publicacion => {
          const sexo = publicacion.user.sexo;
          if (conteoPorSexo.hasOwnProperty(sexo)) {
              conteoPorSexo[sexo]++;
          }
      });

      conteoChazas.push({ 
          nombreChaza: chaza.nombre,
          conteoPorSexo 
      });
  });

  res.status(200).json({
      status: 'success',
      data: {
          conteoChazas
      }
  });
});

exports.agePubliStats = catchAsync(async (req, res, next) => {
  if (req.user.nivelSuscripcion == 0) 
      return next(new AppError("Si deseas ver estadisticas de tus chazas, por favor adquiere el plan especial", 403));

  const misChazas = await Chaza.find({ propietarios: req.user.id });

  if (!misChazas.length) {
      return next(new AppError('No se encontraron chazas para este usuario.', 404));
  }

  const conteoChazas = await Promise.all(misChazas.map(async chaza => {
    const estadisticas = await Publication.aggregate([
      { $match: { chaza: chaza._id } },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $project: {
          "userData.fechaNacimiento": 1
        }
      },
      {
        $addFields: {
          "userEdad": {
            $subtract: [
              { $year: new Date() },
              { $year: "$userData.fechaNacimiento" }
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$userEdad", // Campo por el cual agrupar
          boundaries: [0, 18, 30, 45, 60, 75, 90], // Define tus rangos de edad
          default: "90+", // Para edades superiores al último límite
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    return { 
      nombreChaza: chaza.nombre,
      estadisticas 
    };
    }));

  console.log(conteoChazas);

  res.status(200).json({
    status: 'success',
    data: {
      conteoChazas
    }
  });
});

