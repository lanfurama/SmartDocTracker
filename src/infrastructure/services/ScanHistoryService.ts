export interface ScanHistory {
    id: string;
    qrCode: string;
    documentId: string;
    documentTitle: string;
    timestamp: string;
    status: 'found' | 'not_found';
}

export class ScanHistoryService {
    private static readonly STORAGE_KEY = 'smart-doc-tracker-scan-history';
    private static readonly MAX_HISTORY = 50;

    static getAll(): ScanHistory[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load scan history:', error);
            return [];
        }
    }

    static add(entry: Omit<ScanHistory, 'id' | 'timestamp'>): ScanHistory {
        const newEntry: ScanHistory = {
            ...entry,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };

        const history = this.getAll();
        const updated = [newEntry, ...history].slice(0, this.MAX_HISTORY);

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save scan history:', error);
        }

        return newEntry;
    }

    static getRecent(limit: number = 10): ScanHistory[] {
        return this.getAll().slice(0, limit);
    }

    static clear(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear scan history:', error);
        }
    }

    static remove(id: string): void {
        const history = this.getAll().filter(h => h.id !== id);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to remove scan history:', error);
        }
    }
}
