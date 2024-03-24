const express = require('express');
const {
  checkId,
  checkTourBody,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

const router = express.Router();

router.use((req, res, next) => {
  console.log('I am a middleware local to this route');
  next();
});

// Param middleware that only runs for tour routes that have id as path param.
router.param('id', checkId);

router.route('/').get(getAllTours).post(checkTourBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
