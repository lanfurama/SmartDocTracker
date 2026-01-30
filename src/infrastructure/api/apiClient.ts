const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

import type { Document, LogEntry } from '../../domain/entities/Document';
import type { DocStatus } from '../../shared/constants';

/** Backend may return departmentId/categoryId/updatedAt; map to Document shape */
export function mapDocumentResponseToDocument(res: {
    id: string;
    qrCode: string;
    title: string;
    description?: string;
    department?: string;
    departmentId?: string;
    category?: string;
    categoryId?: string;
    currentStatus: string;
    currentHolder: string;
    lastUpdate?: string;
    updatedAt?: string;
    createdAt: string;
    isBottleneck: boolean;
    history?: Array<{ id?: string | number; action: string; location: string; user: string; type: string; notes?: string; timestamp: string }>;
}): Document {
    const history: LogEntry[] = (res.history || []).map((h, i) => ({
        id: String(h.id ?? i),
        timestamp: h.timestamp,
        action: h.action,
        location: h.location,
        user: h.user,
        notes: h.notes,
        type: (h.type as LogEntry['type']) || 'info'
    }));
    return {
        id: res.id,
        qrCode: res.qrCode,
        title: res.title,
        description: res.description,
        department: res.department ?? res.departmentId,
        category: res.category ?? res.categoryId,
        currentStatus: res.currentStatus as DocStatus,
        currentHolder: res.currentHolder,
        lastUpdate: res.lastUpdate ?? res.updatedAt ?? res.createdAt,
        createdAt: res.createdAt,
        history,
        isBottleneck: Boolean(res.isBottleneck)
    };
}

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

/** Payload for POST /documents/:id/actions - must match backend documentActionSchema */
interface DocumentActionPayload {
    newStatus: string;
    action: string;
    location: string;
    user: string;
    notes?: string;
    type: 'in' | 'out' | 'info' | 'error';
    updateDate?: string;
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

/** Auth API responses */
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: string;
    created_at?: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export interface UserProfileResponse {
    user: AuthUser & { created_at?: string };
}



class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    setToken(token: string | null): void {
        this.token = token;
    }

    getToken(): string | null {
        return this.token;
    }

    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.token = null;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                }
            }
            const body = await response.json().catch(() => ({}));
            // Backend returns { error: { message, code, ... } }
            const msg = (body as { error?: { message?: string }; message?: string }).error?.message
                ?? (body as { message?: string }).message
                ?? `Lỗi ${response.status}`;
            throw new Error(msg);
        }

        return response.json();
    }

    // Auth APIs
    async login(email: string, password: string): Promise<AuthResponse> {
        return this.fetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        return this.fetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    }

    async getMe(): Promise<UserProfileResponse> {
        return this.fetch<UserProfileResponse>('/auth/me');
    }

    async refreshToken(): Promise<{ token: string }> {
        return this.fetch<{ token: string }>('/auth/refresh', { method: 'POST' });
    }

    async updateProfile(name: string): Promise<UserProfileResponse> {
        return this.fetch<UserProfileResponse>('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({ name }),
        });
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
        return this.fetch<{ success: boolean }>('/auth/password', {
            method: 'PATCH',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    async createDocument(payload: CreateDocumentPayload): Promise<DocumentResponse> {
        return this.fetch<DocumentResponse>('/documents', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    /** GET /documents - backend returns { data, pagination }; normalizes to { documents, total, page, totalPages } */
    async getDocuments(query?: {
        search?: string;
        department?: string;
        category?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ documents: Document[]; total: number; page: number; totalPages: number }> {
        const params = new URLSearchParams();
        if (query) {
            const { search, ...rest } = query;
            if (search !== undefined) params.set('q', String(search));
            Object.entries(rest).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        const res = await this.fetch<{ data?: unknown[]; documents?: unknown[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(`/documents?${params.toString()}`);
        const list = res.data ?? res.documents ?? [];
        const pag = res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
        const documents = (list as Parameters<typeof mapDocumentResponseToDocument>[0][]).map(mapDocumentResponseToDocument);
        return {
            documents,
            total: pag.total,
            page: pag.page,
            totalPages: pag.totalPages
        };
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

    // Notifications APIs (require auth)
    async getNotifications(query?: { read?: boolean; limit?: number; offset?: number }): Promise<{
        notifications: NotificationItem[];
        total: number;
        unreadCount: number;
    }> {
        const params = new URLSearchParams();
        if (query) {
            if (query.read !== undefined) params.set('read', String(query.read));
            if (query.limit !== undefined) params.set('limit', String(query.limit));
            if (query.offset !== undefined) params.set('offset', String(query.offset));
        }
        return this.fetch(`/notifications?${params.toString()}`);
    }

    /** Lightweight unread count for badge (polling) */
    async getNotificationUnreadCount(): Promise<{ unreadCount: number }> {
        return this.fetch('/notifications/unread-count');
    }

    async markNotificationRead(id: string): Promise<NotificationItem> {
        return this.fetch(`/notifications/${id}/read`, { method: 'PATCH' });
    }

    async markAllNotificationsRead(): Promise<{ marked: number }> {
        return this.fetch('/notifications/read-all', { method: 'PATCH' });
    }
}

export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    message: string | null;
    type: string;
    read: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: string;
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
    NotificationItem,
};

