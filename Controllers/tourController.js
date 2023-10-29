// const fs = require('fs');
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
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

exports.getAllTours = async (req, res) => {
  try {
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
    const features = new APIFeatures(Tour.find(), req.query)
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
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour(req.body);
    // await newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (e) {
    console.log(e);
  }
};
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

exports.getTour = async (req, res) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // const tour = tours.find((ele) => ele.id === tourId);
  // console.log(tourId);
  try {
    const tour = await Tour.findById(req.params.tourId);
    // findById = Tour.findOne({_id: "req.params.tourId"});
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.updateTour = async (req, res) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // console.log(tourId);
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.deleteTour = async (req, res) => {
  // const tourId = req.params.tourId * 1; //changes string to number
  // console.log(tourId);
  try {
    await Tour.findByIdAndDelete(req.params.tourId);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (e) {
    console.log(e);
  }
};
