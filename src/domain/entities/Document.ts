import { DocStatus } from '../../shared/constants';

export interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    location: string;
    user: string;
    notes?: string;
    type: 'in' | 'out' | 'info' | 'error';
}

export interface Document {
    id: string;
    qrCode: string;
    title: string;
    description?: string;
    department?: string;
    category?: string;
    currentStatus: DocStatus;
    currentHolder: string;
    lastUpdate: string;
    createdAt: string;
    history: LogEntry[];
    isBottleneck: boolean;
}

export interface PerformanceStats {
    totalDocs: number;
    completed: number;
    inTransit: number;
    bottlenecks: number;
}

// Domain logic methods
export const isDocumentBottleneck = (doc: Document): boolean => {
    if (doc.history.length === 0) return false;
    const lastEntry = doc.history[0];
    const hoursSinceUpdate = (Date.now() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24;
};

export const canReceiveDocument = (doc: Document): boolean => {
    return doc.currentStatus !== DocStatus.COMPLETED &&
        doc.currentStatus !== DocStatus.RETURNED;
};

export const canReturnDocument = (doc: Document): boolean => {
    return doc.currentStatus !== DocStatus.RETURNED;
};

export const canTransferDocument = (doc: Document): boolean => {
    return doc.currentStatus !== DocStatus.COMPLETED &&
        doc.currentStatus !== DocStatus.RETURNED;
};
