import { Document } from '../entities/Document';

export interface IDocumentRepository {
    getAll(): Promise<Document[]>;
    getById(id: string): Promise<Document | null>;
    getByQRCode(code: string): Promise<Document | null>;
    save(doc: Document): Promise<Document>;
    update(doc: Document): Promise<Document>;
    delete(id: string): Promise<void>;
}
