import {
    analyticsRepository,
    OverviewStats,
    DepartmentStats,
    CategoryStats,
    TimelineData
} from '../repositories/analyticsRepository';
import { logger } from '../utils/logger';
import { ValidationError } from '../middleware/errors';

export class AnalyticsService {
    /**
     * Get overview statistics
     */
    async getOverview(): Promise<OverviewStats> {
        const stats = await analyticsRepository.getOverview();
        logger.debug('Overview stats retrieved via service', stats);
        return stats;
    }

    /**
     * Get analytics breakdown by department
     */
    async getDepartmentBreakdown(): Promise<DepartmentStats[]> {
        const stats = await analyticsRepository.getByDepartment();
        logger.debug('Department breakdown retrieved via service', { count: stats.length });
        return stats;
    }

    /**
     * Get analytics breakdown by category
     */
    async getCategoryBreakdown(): Promise<CategoryStats[]> {
        const stats = await analyticsRepository.getByCategory();
        logger.debug('Category breakdown retrieved via service', { count: stats.length });
        return stats;
    }

    /**
     * Get timeline data
     * Business rule: days must be between 1 and 90
     */
    async getTimeline(days: number): Promise<TimelineData[]> {
        if (days < 1 || days > 90) {
            throw new ValidationError('Days must be between 1 and 90');
        }

        const timeline = await analyticsRepository.getTimeline(days);
        logger.debug('Timeline data retrieved via service', { days, dataPoints: timeline.length });
        return timeline;
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
