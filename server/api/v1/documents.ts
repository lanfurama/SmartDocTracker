import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { validate, createDocumentSimpleSchema, documentActionSchema } from '../../middleware/validation';
import { documentService } from '../../services';

const router = express.Router();

// GET / - Get all documents with search, filter, and pagination
router.get('/', asyncHandler(async (req, res) => {
    const result = await documentService.searchDocuments(req.query);
    res.json(result);
}));

// GET /:id - Get single document
router.get('/:id', asyncHandler(async (req, res) => {
    const doc = await documentService.getDocumentById(req.params.id);
    res.json(doc);
}));

// POST / - Khởi tạo hồ sơ mới (title, department, category, notes)
router.post('/', validate(createDocumentSimpleSchema), asyncHandler(async (req, res) => {
    const result = await documentService.createDocumentFromForm(req.body);
    res.status(201).json(result);
}));

// POST /:id/actions - Update status and add history
router.post('/:id/actions', validate(documentActionSchema), asyncHandler(async (req, res) => {
    const result = await documentService.updateDocumentStatus({
        documentId: req.params.id,
        ...req.body
    });
    res.json(result);
}));

export default router;
