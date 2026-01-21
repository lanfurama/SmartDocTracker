import { useState, useEffect, useCallback } from 'react';
import { Document } from '../../domain/entities/Document';
import { getDocInsights } from '../../infrastructure/api/geminiService';

export interface UseAiInsightsReturn {
    insights: string | null;
    loading: boolean;
    fetchInsights: (doc: Document) => void;
    clearInsights: () => void;
}

export const useAiInsights = (): UseAiInsightsReturn => {
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchInsights = useCallback(async (doc: Document) => {
        setLoading(true);
        try {
            const result = await getDocInsights(doc);
            setInsights(result);
        } catch {
            setInsights("Không thể phân tích hồ sơ lúc này.");
        } finally {
            setLoading(false);
        }
    }, []);

    const clearInsights = useCallback(() => {
        setInsights(null);
    }, []);

    return {
        insights,
        loading,
        fetchInsights,
        clearInsights
    };
};

// Auto-fetch hook that triggers when doc changes
export const useDocumentInsights = (doc: Document | null): { insights: string | null; loading: boolean } => {
    const { insights, loading, fetchInsights, clearInsights } = useAiInsights();

    useEffect(() => {
        if (doc) {
            fetchInsights(doc);
        } else {
            clearInsights();
        }
    }, [doc, fetchInsights, clearInsights]);

    return { insights, loading };
};
