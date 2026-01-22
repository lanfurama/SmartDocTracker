import { useState, useEffect } from 'react';
import { apiClient, OverviewStats, TimelineData as APITimelineData, DepartmentStats as APIDepartmentStats } from '../infrastructure/api/apiClient';

interface TransformedTimelineData {
    name: string;
    count: number;
    date: string;
}

interface TransformedDepartmentStats {
    department: string;
    total: number;
    completed: number;
    bottlenecks: number;
    avgProcessingHours: string;
    performance: number;
}

interface UseAnalyticsReturn {
    overview: OverviewStats | null;
    timeline: TransformedTimelineData[];
    departments: TransformedDepartmentStats[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [timeline, setTimeline] = useState<TransformedTimelineData[]>([]);
    const [departments, setDepartments] = useState<TransformedDepartmentStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const [overviewData, timelineData, departmentData] = await Promise.all([
                apiClient.getAnalyticsOverview(),
                apiClient.getAnalyticsTimeline(7),
                apiClient.getAnalyticsByDepartment(),
            ]);

            // Transform timeline data for Recharts
            const transformedTimeline = timelineData.map(item => ({
                name: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
                count: item.created,
                date: item.date
            }));

            // Transform department data with calculated performance
            const transformedDepartments = departmentData.map(dept => {
                const completionRate = dept.total > 0 ? (dept.completed / dept.total) * 100 : 0;
                const bottleneckPenalty = dept.bottlenecks * 5; // 5% penalty per bottleneck
                const performance = Math.max(0, Math.min(100, completionRate - bottleneckPenalty));

                return {
                    department: dept.department,
                    total: dept.total,
                    completed: dept.completed,
                    bottlenecks: dept.bottlenecks,
                    avgProcessingHours: dept.avgProcessingHours,
                    performance: Math.round(performance)
                };
            });

            setOverview(overviewData);
            setTimeline(transformedTimeline);
            setDepartments(transformedDepartments);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAnalytics();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    return {
        overview,
        timeline,
        departments,
        loading,
        error,
        lastUpdated,
        refresh: fetchAnalytics,
    };
};
