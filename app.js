/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const compression = require('compression')

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');

const app = express();
app.use(cors())
//setting the pug template view engine to express
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))
//1) GLOBAL MIDDLEWARES
//setting secure http headers
app.use(helmet({ contentSecurityPolicy: false }))

//serving static files
app.use(express.static(path.join(__dirname,'public')));

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
app.use(express.urlencoded({extended: true , limit:'10kb'})); //to parse form data from the url
app.use(cookieParser())

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

app.use(compression());

//3)Routes
app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRoutes);

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
