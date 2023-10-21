const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const chazaRouter = require('./routes/chazaRoutes');
const likeRouter = require('./routes/likeRoutes');
const subscribtionRouter = require('./routes/subscriptionRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const publicationRouter = require('./routes/publicationRoutes');
// const viewRouter = require('./routes/viewRoutes');


const app = express();

// app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());

app.options('*', cors());

// Serving static files
// app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Superaste el máximo número de request desde esta IP, vuelve a intentar en una hora!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'ratingsQuantity',
      'ratingsAverage',
    ]
  })
);

app.use(compression());


// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
// app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chazas', chazaRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/subscribtions', subscribtionRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/publications', publicationRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;