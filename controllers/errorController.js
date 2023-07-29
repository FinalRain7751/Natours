const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value '${key}': '${err.keyValue[key]}'. Use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorsDB = (err) => {
  const errMessages = Object.keys(err.errors)
    .map((key) => err.errors[key].message)
    .join(' ');
  return new AppError(`Invalid input data. ${errMessages}`, 400);
};

const handleJWTError = () =>
  new AppError(`Invalid Token. Please log in again!`, 401);

const handleJWTExpiredError = () =>
  new AppError(`Your token expired. Please log in again!`, 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('ERROR', err);
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  // FOR API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: dont leak error details
    } else {
      // 1) Log error
      console.error('ERROR', err);

      // 2) Send generic message
      res.status(500).json({
        status: 'fail',
        message: 'Something went wrong!',
      });
    }
  } else {
    // RENDERED WEBSITE
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
      // Programming or other unknown error: dont leak error details
    } else {
      // 1) Log error
      console.error('ERROR', err);

      // 2) Send generic message
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorsDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
