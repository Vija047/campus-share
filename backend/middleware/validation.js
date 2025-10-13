import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }

    next();
};

/**
 * Enhanced validation error handler with detailed feedback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const handleValidationErrorsDetailed = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorDetails = errors.array().reduce((acc, error) => {
            const field = error.path || error.param;
            if (!acc[field]) {
                acc[field] = [];
            }
            acc[field].push({
                message: error.msg,
                value: error.value,
                location: error.location
            });
            return acc;
        }, {});

        const firstError = errors.array()[0];

        return res.status(400).json({
            success: false,
            message: firstError.msg,
            field: firstError.path || firstError.param,
            errors: errorDetails
        });
    }

    next();
};

export default {
    handleValidationErrors,
    handleValidationErrorsDetailed
};