const fs = require('fs');

// Code outside request handlers are executed only once, when the application is first
// started on the server. So code outside request handlers are not a part if event loop.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkId = (req, res, next, val) => {
  if (val > tours.length - 1) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};

exports.checkTourBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid request body',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    // This is coming from middleware.
    requestedTime: req.requestTime,
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((t) => t.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newTourId = tours[tours.length - 1].id + 1;
  const newTour = { id: newTourId, ...req.body };
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    // Write strings to file, so convert object to string representation.
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
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
