/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');

const app = express();

//1) GLOBAL MIDDLEWARES
//setting secure http headers
app.use(helmet())

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour window
  message: 'Too many requests from this IP, please try again later',
})

app.use('/api',limiter)

//body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})); //middleware between the request and the response

//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //removes the mongo operators such as gt,lt,gte,lte

//Data sanitization against XSS (CROSS SIDE SCRIPTING)
app.use(xss()); //removes the the html tags in the input

//To prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: [
    'duration',
    'maxGroupSize',
    'ratingsAverage',
    'ratingsQuantity',
    'difficulty',
    'price'
  ]
}));

//serving static files
app.use(express.static(`${__dirname}/public`));

//3)Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `cannot get the request for ${req.originalUrl} was not found`,
  // );
  // err.statusCode = 404;
  // err.status = "fail";
  next(
    new AppError(
      `cannot get the request for ${req.originalUrl} was not found`,
      404,
    ),
  );
});  

//A global error handler middleware function for all types of error
app.use(globalErrorHandler);

module.exports = app;
