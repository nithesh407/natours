const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const tourId = req.params.id * 1; //changes string to number
    // console.log(tourId);
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const tourId = req.params.tourId * 1; //changes string to number
    // console.log(tourId);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No doc found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = Model => catchAsync(async (req, res) => {
    const newdoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newdoc,
      },
    });
});

exports.getOne = (Model,populateOptions) => catchAsync(async (req, res, next) => {
    let query =  Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions)
    const doc = await query;
    // findById = Tour.findOne({_id: "req.params.tourId"});
  
    if (!doc) {
      return next(new AppError('No doc found', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

  exports.getAll = Model => catchAsync(async (req, res) => {
    let id = {};
    if (req.params.id) id = { tour: req.params.id };
    const features = new APIFeatures(Model.find(id), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    // const docs = await features.query.explain();
    // explain() will return the query performence,executionStats and info etc...
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
  