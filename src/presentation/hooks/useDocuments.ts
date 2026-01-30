import { useState, useMemo, useCallback, useEffect } from 'react';
import { Document } from '../../domain/entities/Document';
import { documentService } from '../../application/services/DocumentService';
import { ActionType, executeDocumentAction } from '../../application/useCases/documentActions';
import { apiClient, mapDocumentResponseToDocument } from '../../infrastructure/api/apiClient';

export interface UseDocumentsReturn {
    documents: Document[];
    selectedDoc: Document | null;
    searchQuery: string;
    filteredDocs: Document[];
    scanLoading: boolean;
    setSearchQuery: (query: string) => void;
    selectDoc: (doc: Document | null) => void;
    addDocument: (doc: Document) => void;
    handleScanResult: (code: string) => Promise<void>;
    handleDocAction: (type: ActionType, note: string) => Promise<{ success: boolean; error?: string }>;
}

export const useDocuments = (initialDocs: Document[] = []): UseDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>(initialDocs);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [scanLoading, setScanLoading] = useState(false);

    // Sync documents when initial load from API completes (replace empty list with API result)
    useEffect(() => {
        if (initialDocs.length > 0 && documents.length === 0) {
            setDocuments(initialDocs);
        }
    }, [initialDocs]);

    const filteredDocs = useMemo(() => {
        return documentService.filterDocuments(documents, searchQuery);
    }, [documents, searchQuery]);

    const selectDoc = useCallback((doc: Document | null) => {
        setSelectedDoc(doc);
    }, []);

    const addDocument = useCallback((doc: Document) => {
        setDocuments(prev => [doc, ...prev]);
    }, []);

    const handleScanResult = useCallback(async (code: string) => {
        setScanLoading(true);
        try {
            // Quét mã QR → tra cứu hồ sơ qua API (id = mã QR)
            const raw = await apiClient.getDocumentById(code.trim());
            const doc = mapDocumentResponseToDocument(raw);

            setDocuments(prev => {
                const exists = prev.some(d => d.id === doc.id);
                if (exists) {
                    return prev.map(d => d.id === doc.id ? doc : d);
                }
                return [doc, ...prev];
            });

            setSelectedDoc(doc);
        } catch (error) {
            setScanLoading(false);
            throw error; // App sẽ bắt và hiển thị NotFoundModal
        } finally {
            setScanLoading(false);
        }
    }, []);

    const handleDocAction = useCallback(async (
        type: ActionType,
        note: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!selectedDoc) return { success: false, error: 'Chưa chọn hồ sơ' };

        const result = await executeDocumentAction(selectedDoc, type, note);
        if (!result.success) return { success: false, error: result.error };

        const doc = result.document!;
        const newLog = doc.history[0];
        const payload = {
            newStatus: doc.currentStatus,
            action: newLog.action,
            location: newLog.location,
            user: newLog.user,
            notes: newLog.notes,
            type: newLog.type,
            updateDate: newLog.timestamp
        };

        try {
            const raw = await apiClient.updateDocumentStatus(selectedDoc.id, payload);
            const updated = mapDocumentResponseToDocument(raw);
            setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
            setSelectedDoc(updated);
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
            return { success: false, error: message };
        }
    }, [selectedDoc]);

    return {
        documents,
        selectedDoc,
        searchQuery,
        filteredDocs,
        scanLoading,
        setSearchQuery,
        selectDoc,
        addDocument,
        handleScanResult,
        handleDocAction
    };
};
