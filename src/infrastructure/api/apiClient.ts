const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface CreateDocumentPayload {
    title: string;
    department: string;
    category: string;
    notes?: string;
}

interface DocumentResponse {
    id: string;
    qrCode: string;
    title: string;
    department: string;
    category: string;
    currentStatus: string;
    currentHolder: string;
    lastUpdate: string;
    createdAt: string;
    isBottleneck: boolean;
    history: any[];
}

interface DocumentActionPayload {
    action: 'receive' | 'transfer' | 'return';
    location: string;
    user: string;
    notes?: string;
}

// Analytics Types - matching backend response
interface OverviewStats {
    totalDocs: number;
    completed: number;
    processing: number;
    bottlenecks: number;
    inTransit: number;
}

interface TimelineData {
    date: string;
    created: number;
    completed: number;
    bottlenecks: number;
}

interface DepartmentStats {
    department: string;
    total: number;
    completed: number;
    bottlenecks: number;
    avgProcessingHours: string;
}

interface CategoryStats {
    category: string;
    total: number;
    completed: number;
    bottlenecks: number;
    avgProcessingHours: string;
}



class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async createDocument(payload: CreateDocumentPayload): Promise<DocumentResponse> {
        return this.fetch<DocumentResponse>('/documents', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getDocuments(query?: {
        search?: string;
        department?: string;
        category?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ documents: DocumentResponse[]; total: number; page: number; totalPages: number }> {
        const params = new URLSearchParams();
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.fetch(`/documents?${params.toString()}`);
    }

    async getDocumentById(id: string): Promise<DocumentResponse> {
        return this.fetch(`/documents/${id}`);
    }

    async updateDocumentStatus(
        id: string,
        payload: DocumentActionPayload
    ): Promise<DocumentResponse> {
        return this.fetch(`/documents/${id}/actions`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // Analytics APIs
    async getAnalyticsOverview(): Promise<OverviewStats> {
        return this.fetch('/analytics/overview');
    }

    async getAnalyticsTimeline(days: number = 7): Promise<TimelineData[]> {
        return this.fetch(`/analytics/timeline?days=${days}`);
    }

    async getAnalyticsByDepartment(): Promise<DepartmentStats[]> {
        return this.fetch('/analytics/by-department');
    }

    async getAnalyticsByCategory(): Promise<CategoryStats[]> {
        return this.fetch('/analytics/by-category');
    }
}


export const apiClient = new ApiClient();
export type {
    CreateDocumentPayload,
    DocumentResponse,
    DocumentActionPayload,
    OverviewStats,
    TimelineData,
    DepartmentStats,
    CategoryStats,
};

