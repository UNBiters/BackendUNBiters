const factory = require('./handlerFactory');
const AboutUs = require('./../models/aboutUsModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('El archivo no es una imagen! Por favor sube una imagen', 400), false);
  }
};

exports.resizeAboutusImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
  
    req.file.filename = `aboutus-${req.user.id}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/devs/${req.file.filename}`);
  
    next(); 
});

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadAboutusImage = upload.single('url');

exports.setUser = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createUs = catchAsync(async (req, res, next) => {
  if (req.file) req.body.url = req.file.filename;
  
  const devUser = await AboutUs.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
        user: devUser
    }
  });
})

exports.getAllUs = factory.getAll(AboutUs);
// exports.createUs = factory.createOne(AboutUs);
exports.getOneOfUs = factory.getOne(AboutUs);
exports.updateOneOfUs = factory.updateOne(AboutUs);
exports.deleteOneOfUs = factory.deleteOne(AboutUs);