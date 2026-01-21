import { useState, useMemo, useCallback } from 'react';
import { Document } from '../../domain/entities/Document';
import { documentService } from '../../application/services/DocumentService';
import { ActionType } from '../../application/useCases/documentActions';

export interface UseDocumentsReturn {
    documents: Document[];
    selectedDoc: Document | null;
    searchQuery: string;
    filteredDocs: Document[];
    setSearchQuery: (query: string) => void;
    selectDoc: (doc: Document | null) => void;
    addDocument: (doc: Document) => void;
    handleScanResult: (code: string) => void;
    handleDocAction: (type: ActionType, note: string) => Promise<{ success: boolean; error?: string }>;
}

export const useDocuments = (initialDocs: Document[] = []): UseDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>(initialDocs);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocs = useMemo(() => {
        return documentService.filterDocuments(documents, searchQuery);
    }, [documents, searchQuery]);

    const selectDoc = useCallback((doc: Document | null) => {
        setSelectedDoc(doc);
    }, []);

    const addDocument = useCallback((doc: Document) => {
        setDocuments(prev => [doc, ...prev]);
    }, []);

    const handleScanResult = useCallback((code: string) => {
        const doc = documents.find(d => d.qrCode === code);
        if (doc) {
            setSelectedDoc(doc);
        } else {
            documentService.handleScanResult(code).then(newDoc => {
                setDocuments(prev => [newDoc, ...prev]);
                setSelectedDoc(newDoc);
            });
        }
    }, [documents]);

    const handleDocAction = useCallback(async (
        type: ActionType,
        note: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!selectedDoc) return { success: false, error: 'No document selected' };

        const result = await documentService.performAction(selectedDoc, type, note);

        if (result.success && result.document) {
            setDocuments(prev => prev.map(d =>
                d.id === result.document!.id ? result.document! : d
            ));
            setSelectedDoc(result.document);
        }

        return { success: result.success, error: result.error };
    }, [selectedDoc]);

    return {
        documents,
        selectedDoc,
        searchQuery,
        filteredDocs,
        setSearchQuery,
        selectDoc,
        addDocument,
        handleScanResult,
        handleDocAction
    };
};
