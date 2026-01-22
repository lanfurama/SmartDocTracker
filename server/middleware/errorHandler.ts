import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error values
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let isOperational = false;

    // Check if it's our custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Log error
    if (!isOperational || statusCode >= 500) {
        logger.error('Error occurred', {
            error: {
                message: err.message,
                stack: err.stack,
                code,
                statusCode
            },
            request: {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('user-agent')
            }
        });
    } else {
        logger.warn('Operational error', {
            error: { message: err.message, code, statusCode },
            request: { method: req.method, url: req.url }
        });
    }

    // Send error response
    res.status(statusCode).json({
        error: {
            message,
            code,
            timestamp: new Date().toISOString(),
            // Only include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Async error wrapper to catch promise rejections
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
