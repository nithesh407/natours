const express = require("express");

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getFamousTours,
  getTourStats,
  getMonthlyPlan,
  //checkTourId,
  //checkBody,
} = require("../Controllers/tourController");

const router = express.Router();

// router.param('tourId', checkTourId); //param middleware

// router.route('/').get(getAllTours).post(checkBody, createTour); //chaining middlewares

router.route("/").get(getAllTours).post(createTour);
router.route("/famous-tours").get(getFamousTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/:tourId").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
