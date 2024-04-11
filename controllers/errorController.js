const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const message = `${err.codeName}: ${err.keyValue?.name}`;
    return new AppError(message, 400);
};

const handlevalidationErrorDB = (err) => {
    const allErrors = Object.values(err.errors).map((error) => error.message);
    const message = `Invalid input. ${allErrors.join(' ')}`;
    return new AppError(message, 400);
};

const handleJwtError = () =>
    new AppError('Invalid token, Please log in again', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const errorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const errorProd = (err, res) => {
    // Operational errors that are explicity thrown by developers.
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown errors that are not marked as operational.
        // Send minimum details to the client.
        console.error('Error: ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'dev') {
        errorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handlevalidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJwtError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        errorProd(error, res);
    }
};
