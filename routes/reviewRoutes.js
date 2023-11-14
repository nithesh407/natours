const express = require('express');

const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
  setTourAndUserId,
} = require('../Controllers/reviewController');

const { protect, restrictTo } = require('../Controllers/authController');

//{mergeParams: true} is to get access to the params in the other routers
const router = express.Router({ mergeParams: true });

//POST /tour/123sdqqw/reviews
//GET /tour/123sdqqw/reviews

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserId, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;