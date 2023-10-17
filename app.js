const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const chazaRouter = require('./routes/chazaRoutes');
const likeRouter = require('./routes/likeRoutes');
const subscribtionRouter = require('./routes/subscriptionRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// const viewRouter = require('./routes/viewRoutes');


const app = express();
if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// app.use(express.static(`${__dirname}/public`));

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


app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;