const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();

app.enable('trust proxy');

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Setting up template engine (PUG)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
// Access-Control-Allow-Origin
app.use(cors());

app.options('*', cors());

// Set security http headers
app.use(
  helmet({
    // "contentSecurityPolicy": false,
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'", 'https://js.stripe.com/v3/'],
        'img-src': ["'self'", 'https://api.maptiler.com/maps/dataviz/'],
        'script-src': ["'self'", 'https://js.stripe.com/v3/'],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting the number of requests from an IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour!',
});
app.use('/api', limiter);

// This route needs the raw req
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser; reading data from body into req.body
// Cookie parse; reading data from body into req.cookie
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS(cross-site scripting)
app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Compression the texts in response
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString;
  // console.log(req.cookies);
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handling unhandled routes

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
