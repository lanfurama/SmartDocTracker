import { documentRepository, CreateDocumentData, UpdateStatusData, DocumentFilters } from '../repositories/documentRepository';
import { logger } from '../utils/logger';
import { generateDocId } from '../utils/docId';
import { NotFoundError, ConflictError, ValidationError } from '../middleware/errors';

export interface CreateDocumentInput extends CreateDocumentData { }

export interface CreateDocumentResult {
    status: string;
    id: string;
}

/** Input for "Khởi tạo hồ sơ mới" form: title, department, category, notes */
export interface CreateDocumentFormInput {
    title: string;
    department: string;
    category: string;
    notes?: string;
}

/** Response shape for frontend after creating document (id, qrCode, title, department, category, currentStatus, currentHolder, lastUpdate, createdAt, isBottleneck, history) */
export interface CreateDocumentFormResult {
    id: string;
    qrCode: string;
    title: string;
    description?: string;
    department: string;
    category: string;
    currentStatus: string;
    currentHolder: string;
    lastUpdate: string;
    createdAt: string;
    isBottleneck: boolean;
    history: any[];
}

export interface DocumentActionInput extends UpdateStatusData {
    documentId: string;
}

export interface PaginatedDocuments {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DocumentWithHistory {
    id: string;
    qrCode: string;
    title: string;
    description: string;
    departmentId: string;
    categoryId: string;
    currentStatus: string;
    currentHolder: string;
    isBottleneck: boolean;
    createdAt: string;
    updatedAt: string;
    history: any[];
}

export class DocumentService {
    /**
     * Helper to format document from DB row
     */
    private formatDoc(doc: any, historyRows: any[] = []): DocumentWithHistory {
        return {
            id: doc.id,
            qrCode: doc.qr_code,
            title: doc.title,
            description: doc.description,
            departmentId: doc.department_id,
            categoryId: doc.category_id,
            currentStatus: doc.current_status,
            currentHolder: doc.current_holder_name,
            isBottleneck: doc.is_bottleneck,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
            history: historyRows.map(h => ({
                id: h.id,
                action: h.action,
                location: h.location,
                user: h.actor_name,
                type: h.action_type,
                notes: h.notes,
                timestamp: h.created_at
            }))
        };
    }

    /**
     * Create new document (full payload - internal use)
     */
    async createDocument(input: CreateDocumentInput): Promise<CreateDocumentResult> {
        const exists = await documentRepository.existsByQrCode(input.qrCode);
        if (exists) {
            throw new ConflictError(`Document with QR code '${input.qrCode}' already exists`);
        }
        const id = await documentRepository.create(input);
        logger.info('Document created via service', { documentId: id, qrCode: input.qrCode });
        return { status: 'created', id };
    }

    /**
     * Khởi tạo hồ sơ mới: create document from form (title, department, category, notes).
     * Generates id/qrCode, sets initial status SENDING, returns full document for frontend.
     */
    async createDocumentFromForm(input: CreateDocumentFormInput): Promise<CreateDocumentFormResult> {
        const now = new Date().toISOString();
        let id = generateDocId(input.department, input.category);
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
            const exists = await documentRepository.existsByQrCode(id);
            if (!exists) break;
            id = generateDocId(input.department, input.category);
            if (i === maxRetries - 1) {
                throw new ConflictError('Không thể tạo mã hồ sơ duy nhất, vui lòng thử lại');
            }
        }

        const data: CreateDocumentData = {
            id,
            qrCode: id,
            title: input.title,
            description: input.notes ?? '',
            department: input.department,
            category: input.category,
            currentStatus: 'SENDING',
            currentHolder: 'Người tạo',
            createdAt: now,
            history: [
                { action: 'Khởi tạo', location: 'Hệ thống', user: 'Người tạo', type: 'in', timestamp: now }
            ]
        };

        await documentRepository.create(data);
        logger.info('Document created from form', { documentId: id, title: input.title });

        const doc = await this.getDocumentById(id);
        return {
            id: doc.id,
            qrCode: doc.qrCode,
            title: doc.title,
            description: doc.description || undefined,
            department: doc.departmentId,
            category: doc.categoryId,
            currentStatus: doc.currentStatus,
            currentHolder: doc.currentHolder,
            lastUpdate: doc.updatedAt,
            createdAt: doc.createdAt,
            isBottleneck: doc.isBottleneck,
            history: doc.history
        };
    }

    /**
     * Update document status
     * Business rules:
     * - Document must exist
     * - Return actions require notes
     * - Status transitions are validated
     */
    async updateDocumentStatus(input: DocumentActionInput): Promise<DocumentWithHistory> {
        const { documentId, ...updateData } = input;

        // Validate return actions have notes
        if (updateData.action.includes('Trả') || updateData.action.toLowerCase().includes('return')) {
            if (!updateData.notes || updateData.notes.trim().length === 0) {
                throw new ValidationError('Vui lòng nhập lý do trả hồ sơ (lý do lỗi/thiếu sót)');
            }
        }

        // Update via repository
        const result = await documentRepository.updateStatus(documentId, updateData);

        logger.info('Document status updated via service', {
            documentId,
            action: updateData.action,
            newStatus: updateData.newStatus
        });

        return this.formatDoc(result.document, result.history);
    }

    /**
     * Search documents with filters and pagination
     */
    async searchDocuments(filters: DocumentFilters): Promise<PaginatedDocuments> {
        const result: any = await documentRepository.findAll(filters);

        const page = typeof filters.page === 'string' ? parseInt(filters.page) : (filters.page || 1);
        const limit = typeof filters.limit === 'string' ? parseInt(filters.limit) : (filters.limit || 20);

        // Group history by document
        const historyMap = new Map<string, any[]>();
        if (result.history) {
            for (const h of result.history) {
                if (!historyMap.has(h.document_id)) {
                    historyMap.set(h.document_id, []);
                }
                historyMap.get(h.document_id)!.push(h);
            }
        }

        const docs = result.rows.map(doc => this.formatDoc(doc, historyMap.get(doc.id) || []));

        return {
            data: docs,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }

    /**
     * Get single document by ID with full history
     */
    async getDocumentById(id: string): Promise<DocumentWithHistory> {
        const result = await documentRepository.findById(id);

        if (!result) {
            throw new NotFoundError(`Document with ID '${id}' not found`);
        }

        return this.formatDoc(result.document, result.history);
    }

    /**
     * Update bottleneck flags for stale documents
     */
    async updateBottleneckFlags(thresholdHours: number = 24): Promise<{ totalUpdated: number; newBottlenecks: number }> {
        const result = await documentRepository.updateBottleneckFlags(thresholdHours);

        logger.info('Bottleneck flags updated via service', {
            totalUpdated: result.totalUpdated,
            newBottlenecks: result.newBottlenecks,
            threshold: thresholdHours
        });

        return result;
    }
}

// Export singleton instance
export const documentService = new DocumentService();
