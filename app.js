const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");

const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(`${__dirname}/public`));
app.use(express.json()); //middleware between the request and the response

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(
  //   `cannot get the request for ${req.originalUrl} was not found`,
  // );
  // err.statusCode = 404;
  // err.status = "fail";

  next(
    new AppError(
      `cannot get the request for ${req.originalUrl} was not found`,
      404
    )
  )
});

//A global error handler middleware function for all types of error
app.use(globalErrorHandler);

module.exports = app;
