import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors';

// Schema for creating a new document (full payload - internal)
export const createDocumentSchema = z.object({
    id: z.string().min(1, 'Document ID is required'),
    qrCode: z.string().min(1, 'QR code is required'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    description: z.string().optional(),
    department: z.string().optional(),
    category: z.string().optional(),
    currentStatus: z.enum(['SENDING', 'TRANSIT_DA_NANG', 'TRANSIT_HCM', 'PROCESSING', 'COMPLETED', 'RETURNED']),
    currentHolder: z.string().min(1, 'Current holder is required'),
    createdAt: z.string().optional(),
    history: z.array(z.object({
        action: z.string(),
        location: z.string(),
        user: z.string(),
        type: z.enum(['in', 'out', 'info', 'error']),
        notes: z.string().optional(),
        timestamp: z.string()
    })).optional()
});

// Schema for "Khởi tạo hồ sơ mới" - user form: title, department, category, notes
export const createDocumentSimpleSchema = z.object({
    title: z.string().min(3, 'Tên hồ sơ phải có ít nhất 3 ký tự').max(200, 'Tên hồ sơ quá dài'),
    department: z.string().min(1, 'Phòng ban là bắt buộc'),
    category: z.string().min(1, 'Loại chứng từ là bắt buộc'),
    notes: z.string().optional()
});

// Schema for document actions
export const documentActionSchema = z.object({
    newStatus: z.enum(['SENDING', 'TRANSIT_DA_NANG', 'TRANSIT_HCM', 'PROCESSING', 'COMPLETED', 'RETURNED']),
    action: z.string().min(1, 'Action is required'),
    location: z.string().min(1, 'Location is required'),
    user: z.string().min(1, 'User is required'),
    notes: z.string().optional(),
    type: z.enum(['in', 'out', 'info', 'error']),
    updateDate: z.string().optional()
}).refine(
    (data) => {
        // If action contains "Trả" (return), notes must be provided
        if (data.action.includes('Trả') || data.action.toLowerCase().includes('return')) {
            return data.notes && data.notes.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Vui lòng nhập lý do trả hồ sơ (lý do lỗi/thiếu sót)',
        path: ['notes']
    }
);

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                throw new ValidationError(messages.join(', '));
            }
            next(error);
        }
    };
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            // Remove potential XSS patterns
            return obj
                .replace(/[<>]/g, '')
                .trim();
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    // Note: In Express 5.x, req.query and req.params are read-only
    // Query/params validation should be done in route handlers or validation schemas

    next();
};
