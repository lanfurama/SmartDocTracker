import { useState, useMemo, useCallback } from 'react';
import { Document } from '../../domain/entities/Document';
import { documentService } from '../../application/services/DocumentService';
import { ActionType } from '../../application/useCases/documentActions';

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
            // Always fetch from API to ensure we have latest data
            const doc = await documentService.handleScanResult(code);

            // Update local state
            setDocuments(prev => {
                const exists = prev.some(d => d.id === doc.id);
                if (exists) {
                    return prev.map(d => d.id === doc.id ? doc : d);
                }
                return [doc, ...prev];
            });

            setSelectedDoc(doc);
        } catch (error) {
            console.error('Failed to lookup document:', error);
            // Create a placeholder document for unknown QR codes
            const newDoc = await documentService.handleScanResult(code);
            setDocuments(prev => [newDoc, ...prev]);
            setSelectedDoc(newDoc);
        } finally {
            setScanLoading(false);
        }
    }, []);

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
        scanLoading,
        setSearchQuery,
        selectDoc,
        addDocument,
        handleScanResult,
        handleDocAction
    };
};
