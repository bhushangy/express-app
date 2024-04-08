// Class for creating operational errors - Errors that you can predict beforehand.
// ex: invalid path, user input, failed db connections, request timeout etc.
module.exports = class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Add the current stack trace to this object and remove the trace where this constructor
        // function is called to create an Error object as its not useful. It will only include
        // traces of function calls before the new ApiError() code.
        Error.captureStackTrace(this, this.constructor);
    }
};
