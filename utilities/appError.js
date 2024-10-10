// utilities\appError.js

class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code.
     * @param {string} errorCode - The custom error code.
     * @param {object} [details] - Additional error details.
     */
    constructor(message, statusCode, errorCode, details = {}) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;
  