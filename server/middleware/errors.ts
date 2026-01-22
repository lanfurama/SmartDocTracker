// Custom error classes for standardized error handling
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code = 'VALIDATION_ERROR') {
        super(message, 400, code);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(message, 409, code);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, code = 'DATABASE_ERROR') {
        super(message, 500, code, false);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string, code = 'AUTHENTICATION_ERROR') {
        super(message, 401, code);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string, code = 'AUTHORIZATION_ERROR') {
        super(message, 403, code);
    }
}
