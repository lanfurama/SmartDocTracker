import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient, type NotificationItem } from '../../infrastructure/api/apiClient';

export type NotificationReadFilter = 'all' | 'unread';

export interface UseNotificationsReturn {
    notifications: NotificationItem[];
    total: number;
    unreadCount: number;
    loading: boolean;
    error: string | null;
    readFilter: NotificationReadFilter;
    markingId: string | null;
    markingAll: boolean;
    setReadFilter: (filter: NotificationReadFilter) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const POLL_UNREAD_INTERVAL_MS = 60_000;

export function useNotifications(enabled: boolean): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [total, setTotal] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [readFilter, setReadFilterState] = useState<NotificationReadFilter>('all');
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [markingAll, setMarkingAll] = useState(false);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevReadFilterRef = useRef<NotificationReadFilter>(readFilter);

    const refresh = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        setError(null);
        try {
            const readParam = readFilter === 'unread' ? false : undefined;
            const res = await apiClient.getNotifications({ read: readParam, limit: 50, offset: 0 });
            setNotifications(res.notifications);
            setTotal(res.total);
            setUnreadCount(res.unreadCount);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Không tải được thông báo');
            setNotifications([]);
            setTotal(0);
            setUnreadCount((prev) => prev);
        } finally {
            setLoading(false);
        }
    }, [enabled, readFilter]);

    const fetchUnreadCountOnly = useCallback(async () => {
        if (!enabled) return;
        try {
            const res = await apiClient.getNotificationUnreadCount();
            setUnreadCount(res.unreadCount);
        } catch {
            // keep previous unreadCount on poll failure
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;
        fetchUnreadCountOnly();
        pollTimerRef.current = setInterval(fetchUnreadCountOnly, POLL_UNREAD_INTERVAL_MS);
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        };
    }, [enabled, fetchUnreadCountOnly]);

    const setReadFilter = useCallback((filter: NotificationReadFilter) => {
        setReadFilterState(filter);
    }, []);

    useEffect(() => {
        if (!enabled || prevReadFilterRef.current === readFilter) return;
        prevReadFilterRef.current = readFilter;
        refresh();
    }, [readFilter, enabled, refresh]);

    const retry = useCallback(async () => {
        setError(null);
        await refresh();
    }, [refresh]);

    const markAsRead = useCallback(async (id: string) => {
        setMarkingId(id);
        try {
            await apiClient.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
            // keep state on error
        } finally {
            setMarkingId(null);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setMarkingAll(true);
        try {
            await apiClient.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // keep state on error
        } finally {
            setMarkingAll(false);
        }
    }, []);

    return {
        notifications,
        total,
        unreadCount,
        loading,
        error,
        readFilter,
        markingId,
        markingAll,
        setReadFilter,
        refresh,
        retry,
        markAsRead,
        markAllAsRead,
    };
}
