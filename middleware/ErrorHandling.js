const express = require('express');
const AppError = require('./utilities/appError');

const app = express();

// Error-handling middleware
app.use((err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: {
                message: err.message,
                errorCode: err.errorCode,
                details: err.details,
            },
        });
    } else {
        // Handle non-AppError instances
        res.status(500).json({ error: { message: 'Internal Server Error' } });
    }
});