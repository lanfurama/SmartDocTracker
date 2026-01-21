import { Document, LogEntry } from '../../domain/entities/Document';
import { IDocumentRepository } from '../../domain/interfaces/IDocumentRepository';
import { DocStatus } from '../../shared/constants';

// Mock data - will be replaced with real API calls
const MOCK_DOCS: Document[] = [
    {
        id: 'KTO-QTTX-0324-001',
        qrCode: 'KTO-QTTX-0324-001',
        title: 'Hồ sơ quyết toán thuế Q1-2024',
        department: 'KTO',
        category: 'QTTX',
        currentStatus: DocStatus.PROCESSING,
        currentHolder: 'Nguyễn Văn A',
        lastUpdate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        isBottleneck: true,
        history: [
            { id: '1', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), action: 'Khởi tạo', location: 'VP Hà Nội', user: 'Trần B', type: 'in' },
            { id: '2', timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), action: 'Nhập kho', location: 'VP Đà Nẵng', user: 'Lê C', type: 'in' },
            { id: '3', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), action: 'Bàn giao', location: 'Phòng Kế toán', user: 'Nguyễn Văn A', type: 'in', notes: 'Đang đợi kiểm duyệt' },
        ]
    },
    {
        id: 'NNS-HDLD-0424-042',
        qrCode: 'NNS-HDLD-0424-042',
        title: 'Hợp đồng lao động - Trần Nhân',
        department: 'NNS',
        category: 'HDLD',
        currentStatus: DocStatus.TRANSIT_HCM,
        currentHolder: 'Kho HCM',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        isBottleneck: false,
        history: [
            { id: '1', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), action: 'Khởi tạo', location: 'VP Hà Nội', user: 'Trần B', type: 'in' },
            { id: '2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: 'Nhập kho', location: 'VP HCM', user: 'Phạm D', type: 'in' },
        ]
    }
];

export class DocumentRepository implements IDocumentRepository {
    private documents: Document[] = [...MOCK_DOCS];

    async getAll(): Promise<Document[]> {
        return [...this.documents];
    }

    async getById(id: string): Promise<Document | null> {
        return this.documents.find(d => d.id === id) || null;
    }

    async getByQRCode(code: string): Promise<Document | null> {
        return this.documents.find(d => d.qrCode === code) || null;
    }

    async save(doc: Document): Promise<Document> {
        this.documents = [doc, ...this.documents];
        return doc;
    }

    async update(doc: Document): Promise<Document> {
        this.documents = this.documents.map(d => d.id === doc.id ? doc : d);
        return doc;
    }

    async delete(id: string): Promise<void> {
        this.documents = this.documents.filter(d => d.id !== id);
    }
}

// Singleton instance
export const documentRepository = new DocumentRepository();
