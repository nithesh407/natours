// const fs = require('fs');
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkTourId = (req, res, next, val) => {
//   //param middleware callback
//   console.log(`tour id is ${val}`);
//   if (req.params.tourId * 1 > tours.length || req.params.tourId * 1 < 1) {
//     return res.status(404).json({
//       status: 'error',
//       data: {
//         tour: 'tour not found',
//       },
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'error',
//       message: 'please provide a name or price',
//     });
//   }
//   next();
// };

exports.getFamousTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // console.log(req.query);
  // const tours = await Tour.find({
  //   duration: 5,
  //   difficulty: 'easy',
  // });

  //1A)Filtering
  // const queryObj = { ...req.query }; //assigns every field to the query object
  // const excludeFields = ['page', 'sort', 'limit', 'field'];
  // excludeFields.forEach((el) => delete queryObj[el]); //ignores all the excluded fields
  // console.log(req.query, queryObj);

  // //1B)Advanced filtering for operators
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // console.log(JSON.parse(queryStr));
  // console.log(queryObj);

  // let query = Tour.find(JSON.parse(queryStr));

  //2)sorting
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // //3) Field Limit
  // if (req.query.field) {
  //   const field = req.query.field.split(',').join(' ');
  //   query = query.select(field); //includes the respective field
  // } else {
  //   query = query.select('-__v'); //excludes the '__v' field
  // }

  // //4) Pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTour = await Tour.countDocuments();
  //   if (skip >= numTour) {
  //     throw new Error('This page does not exist');
  //   }
  // }
  //Execute the query
  const features = new APIFeatures(Tour, req.query)
    .filter()
    .sort()
    .limitField()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
  // try {
  //   // const newTour = new Tour(req.body);
  //   // await newTour.save();
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: "success",
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (e) {
  //   res.status(400).json({
  //     status: "error",
  //     message: e.message,
  //   });
  // }
});
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// console.log(newTour);
// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     if (err) console.log(err);
//     res.status(201).json({
//       stats: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   },
// );

exports.getTour = catchAsync(async (req, res, next) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // const tour = tours.find((ele) => ele.id === tourId);
  // console.log(tourId);

  const tour = await Tour.findById(req.params.tourId);
  // findById = Tour.findOne({_id: "req.params.tourId"});

  if (!tour) {
    return next(new AppError("No tour found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // console.log(tourId);

  const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError("No tour found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // console.log(tourId);
  const tour = await Tour.findByIdAndDelete(req.params.tourId);

  if (!tour) {
    return next(new AppError("No tour found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $group: { _id: { $ne: "EASY" } },
    // },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
    // {
    //   $limit: 5,
    // },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});
