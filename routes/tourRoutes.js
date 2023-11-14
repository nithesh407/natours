const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getFamousTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
  //checkTourId,
  //checkBody,
} = require('../Controllers/tourController');
const { protect, restrictTo } = require('../Controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('tourId', checkTourId); //param middleware

//POST /tour/123sdqqw/reviews
//GET /tour/123sdqqw/reviews
//GET /tour/123sdqqw/reviews/123dqwets

router.use('/:id/review', reviewRouter);

// router.route('/:tourId/review').post(protect, restrictTo('user'), createReview);

// router.route('/').get(getAllTours).post(checkBody, createTour); //chaining middlewares

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/famous-tours')
  .get(getFamousTours, getAllTours);
router
  .route('/tour-stats')
  .get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide','guide'), getMonthlyPlan);

// /tours-within?distance=423&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)

router
  .route('/tours-within/distances/:latlng/unit/:unit')
  .get(getDistances)  

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
