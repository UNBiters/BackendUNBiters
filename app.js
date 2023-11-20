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
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require('connect-mongo');
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/userModel');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const chazaRouter = require('./routes/chazaRoutes');
const likeRouter = require('./routes/likeRoutes');
const subscriptionRouter = require('./routes/subscriptionRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const publicationRouter = require('./routes/publicationRoutes');
const aboutusRouter = require('./routes/aboutusRouter');
const oauthRouter = require('./routes/oauthRouter');
// const viewRouter = require('./routes/viewRoutes');


const app = express();

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// app.enable('trust proxy');

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionID",
    store: MongoStore.create({
      mongoUrl: DB, // Replace with your MongoDB URL
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      maxAge: 1000 * 60 * 60 * 24, // e.g., 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://unbiters.vercel.app/api/v1/oauth/google/callback"
          : "http://localhost:3000/api/v1/oauth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {      
      try {
        // Check if user exists in DB
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        } else {
          // Create new user
          user = new User({
            googleId: profile.id,
            nombre: profile.displayName,
            correo: profile._json.email,
          });
          await user.save({validateBeforeSave: false});
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
passport.serializeUser((user, done) => {
  console.log('Serializando usuario:', user);
  done(null, user._id);
});

passport.deserializeUser(User.deserializeUser());


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());

app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));
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
//app.use('/api', limiter);

// app.use(express.json({ limit: '10kb' }));
app.use(express.json());
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
app.use('/api/v1/payment', subscriptionRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/publications', publicationRouter);
app.use('/api/v1/aboutus', aboutusRouter);
app.use('/api/v1/oauth', oauthRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;