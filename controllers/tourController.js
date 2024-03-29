const Tour = require('../models/tourModels');

// Code outside request handlers (like the one below) are executed only once, when the application is first
// started on the server. So code outside request handlers are not a part if event loop.
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

exports.getAllTours = (req, res) => {
  res.status(200).json({
    // This is coming from middleware.
    requestedTime: req.requestTime,
    status: 'success',
    data: {},
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {},
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: `Tour ${req.params.id} updated.`,
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
