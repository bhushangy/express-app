const express = require('express');
const {
  aliasTopTours,
  getTourStats,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// router.use((req, res, next) => {
//   console.log('I am a middleware local to this route');
//   next();
// });

// Param middleware that only runs for tour routes that have id as path param.
// router.param('id', checkId);

router.route('/').get(protect, getAllTours).post(createTour);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
