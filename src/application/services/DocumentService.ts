import { Document } from '../../domain/entities/Document';
import { IDocumentRepository } from '../../domain/interfaces/IDocumentRepository';
import { documentRepository } from '../../infrastructure/repositories/DocumentRepository';
import {
    executeDocumentAction,
    createNewDocumentFromScan,
    ActionType,
    ActionResult
} from '../useCases/documentActions';

export class DocumentService {
    constructor(private repository: IDocumentRepository = documentRepository) { }

    async getAllDocuments(): Promise<Document[]> {
        return this.repository.getAll();
    }

    async findByQRCode(code: string): Promise<Document | null> {
        return this.repository.getByQRCode(code);
    }

    async handleScanResult(code: string): Promise<Document> {
        const existingDoc = await this.repository.getByQRCode(code);
        if (existingDoc) {
            return existingDoc;
        }

        const newDoc = createNewDocumentFromScan(code);
        return this.repository.save(newDoc);
    }

    async performAction(
        doc: Document,
        actionType: ActionType,
        note: string
    ): Promise<ActionResult> {
        const result = await executeDocumentAction(doc, actionType, note);

        if (result.success && result.document) {
            await this.repository.update(result.document);
        }

        return result;
    }

    async createDocument(doc: Document): Promise<Document> {
        return this.repository.save(doc);
    }

    filterDocuments(documents: Document[], query: string): Document[] {
        if (!query) return documents;
        const lowerQuery = query.toLowerCase();
        return documents.filter(d =>
            d.title.toLowerCase().includes(lowerQuery) ||
            d.id.toLowerCase().includes(lowerQuery)
        );
    }
}

// Singleton instance
export const documentService = new DocumentService();
