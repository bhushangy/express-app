// express is a function
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

// invoking express adds a bunch of methods on the app object.
const app = express();

// Morgan is the loggin middleware. Calling morgan() function returns another middleware function
// that is added to the middleware stack.
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

// Middleware to serve files
app.use(express.static(`${__dirname}/public`));

// Middleware to modify incoming request i.e to add data from HTTP request to req object.
// express.json() returns a functions that is added to the middleware stack.
app.use(express.json());

// Order of defining middlewares is important. If this middleware is defined after request handlers,
// then it wont execute because the request handler ends the req-res cycle with res.send().
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(x) - Reference Error
  // Any unknown, unhanlded exception in code, occuring inside any middleware, express transfers control to error handling middleware.
  next();
});

// Here tourRouter is a middleware. You are mounting this middleware for tours path.
// This is invoked only for /api/v1/tours path.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle incorrect routes by adding this middleware at the end of the middleware stack.
app.all('*', (req, res, next) => {
  // So whenever you pass an argument into next(‘error’), express automatically assumes
  // that there was an error, and it skips all the middleware in the middleware stack and
  // send the argument that you passed to the global error handling middleware.
  next(new AppError(`Cannot find route ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;

// PUT - You expect the entire object that needs to be updated. The object received will replace the existing one.
// PATCH - You expect only certain parts of the object that need to be updated. Only the fields received are updated and not the entire object.
// PATCH is easier for the FE cause it needs to send only the parts that need update instead of the entire object.
