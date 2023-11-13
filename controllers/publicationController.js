const Publication = require('./../models/publicationModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const slugify = require('slugify');
const Chaza = require('../models/chazaModel');

const path = require('path');
const multerStorage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: path.join("/tmp"),
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
    new: true,
    runValidators: true
  });
  
  if (!currentPublication) {
    return next(new AppError("No se encontro la publicación buscada por este usuario", 404));
  }

  console.log(updatedPublication);
  const slug = slugify(currentPublication.nombreChaza, {lower: true});
  if (slug != updatedPublication.slug) {
    await Chaza.findOneAndUpdate({ slug }, { $inc: { numPublications: -1 } })
    await Chaza.findOneAndUpdate({ slug: updatedPublication.slug }, { $inc: { numPublications: 1 } } )
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

