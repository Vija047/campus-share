// Async error handler wrapper
export const catchAsyncError = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFound = (req, res, next) => {
    // Don't log common browser requests that aren't actual API errors
    const ignoredPaths = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
    const isIgnoredPath = ignoredPaths.some(path => req.originalUrl.includes(path));

    // Don't log when someone accesses /api directly (it has a proper response)
    const isDirectApiAccess = req.originalUrl === '/api';

    if (!isIgnoredPath && !isDirectApiAccess) {
        console.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    }

    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
