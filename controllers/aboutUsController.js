const factory = require('./handlerFactory');
const AboutUs = require('./../models/aboutUsModel');
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





exports.getAllUs = factory.getAll(AboutUs);
exports.createUs = factory.createOne(AboutUs);
exports.getOneOfUs = factory.getOne(AboutUs);
exports.updateOneOfUs = factory.updateOne(AboutUs);
exports.deleteOneOfUs = factory.deleteOne(AboutUs);