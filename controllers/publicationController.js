const Publication = require('./../models/publicationModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('El archivo no es una imagen! Por favor sube una imagen', 400), false);
  }
};

exports.resizePublicationImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
  
    req.file.filename = `publication-${req.user.id}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(700, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/publications/${req.file.filename}`);
  
    next(); 
});

const upload = multer({
  storage: multerStorage,
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
exports.createPublication = factory.createOne(Publication);
exports.updatePublication = factory.updateOne(Publication);
exports.deletePublication = factory.deleteOne(Publication);

exports.updateMyPublication = catchAsync(async (req, res, next) => {

    const filteredBody = {
        user: req.user.id,
        texto: req.body.texto,
        nombreChaza: req.body.nombreChaza,
        rating: req.body.rating
    }

    if (req.file) filteredBody.imagen = req.file.filename;

    const updatedPublication = await Publication.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            publication: updatedPublication
        }
    });
});

exports.deleteMyPublication = catchAsync(async (req, res, next) => {
  const deletedPublication = await Publication.findByIdAndDelete(req.params.id);
  if (!deletedPublication) {
    return next(new AppError('No se encontro una publicación asociada a este usuario', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
})
