/* eslint-disable import/no-extraneous-dependencies */
// const fs = require('fs');

const multer = require('multer'); //to get the img from the form and to handle the multi part form data
const sharp = require('sharp'); //to resize the image 

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {name: 'imageCover' , maxCount: 1},
  {name: 'images',maxCount:3}
])

exports.resizeTourImages = catchAsync(async(req,res,next) =>{
  // console.log(req.files);

  //1) imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333, {
      position: 'center',
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) Images  
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
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
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // const tourId = req.params.tourId * 1; //changes string to number
//   // console.log(tourId);
//   const tour = await Tour.findByIdAndDelete(req.params.tourId);

//   if (!tour) {
//     return next(new AppError('No tour found', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
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
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
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
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
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
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
//Do not update passwords with this
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// /tours-within?distance=423&center=11.2699408,77.5915924&unit=mi
// /tours-within/233/center/11.2699408,77.5915924/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async(req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi'? 0.000621371 : 0.001

  if (!lat || !lng)
    return next(
      new AppError('Please provide lat and lng coordinates for distances'),
    );
  
  const distances = await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      },
    },
    {
      $project:{
        distance:1,
        name: 1
      }
    }
  ])  

  res.status(200).json({
    status: 'success',
    data:{
      tours: distances
    }
  })
});

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
