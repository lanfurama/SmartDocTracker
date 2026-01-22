import { query } from '../db';

export interface OverviewStats {
    totalDocs: number;
    completed: number;
    processing: number;
    bottlenecks: number;
    inTransit: number;
}

export interface DepartmentStats {
    department: string;
    total: number;
    completed: number;
    bottlenecks: number;
    avgProcessingHours: string;
}

export interface CategoryStats {
    category: string;
    total: number;
    completed: number;
    bottlenecks: number;
    avgProcessingHours: string;
}

export interface TimelineData {
    date: string;
    created: number;
    completed: number;
    bottlenecks: number;
}

export const analyticsRepository = {
    /**
     * Get overview statistics
     */
    async getOverview(): Promise<OverviewStats> {
        const [totalRes, completedRes, processingRes, bottleneckRes] = await Promise.all([
            query('SELECT COUNT(*) FROM documents'),
            query("SELECT COUNT(*) FROM documents WHERE current_status = 'COMPLETED'"),
            query("SELECT COUNT(*) FROM documents WHERE current_status = 'PROCESSING'"),
            query('SELECT COUNT(*) FROM documents WHERE is_bottleneck = true')
        ]);

        const totalDocs = parseInt(totalRes.rows[0].count);
        const completed = parseInt(completedRes.rows[0].count);
        const processing = parseInt(processingRes.rows[0].count);
        const bottlenecks = parseInt(bottleneckRes.rows[0].count);

        return {
            totalDocs,
            completed,
            processing,
            bottlenecks,
            inTransit: totalDocs - completed
        };
    },

    /**
     * Get analytics breakdown by department
     */
    async getByDepartment(): Promise<DepartmentStats[]> {
        const result = await query(`
            SELECT 
                department_id,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE current_status = 'COMPLETED') as completed,
                COUNT(*) FILTER (WHERE is_bottleneck = true) as bottlenecks,
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_processing_hours
            FROM documents
            WHERE department_id IS NOT NULL
            GROUP BY department_id
            ORDER BY total DESC
        `);

        return result.rows.map(row => ({
            department: row.department_id,
            total: parseInt(row.total),
            completed: parseInt(row.completed),
            bottlenecks: parseInt(row.bottlenecks),
            avgProcessingHours: parseFloat(row.avg_processing_hours || 0).toFixed(2)
        }));
    },

    /**
     * Get analytics breakdown by category
     */
    async getByCategory(): Promise<CategoryStats[]> {
        const result = await query(`
            SELECT 
                category_id,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE current_status = 'COMPLETED') as completed,
                COUNT(*) FILTER (WHERE is_bottleneck = true) as bottlenecks,
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_processing_hours
            FROM documents
            WHERE category_id IS NOT NULL
            GROUP BY category_id
            ORDER BY total DESC
        `);

        return result.rows.map(row => ({
            category: row.category_id,
            total: parseInt(row.total),
            completed: parseInt(row.completed),
            bottlenecks: parseInt(row.bottlenecks),
            avgProcessingHours: parseFloat(row.avg_processing_hours || 0).toFixed(2)
        }));
    },

    /**
     * Get timeline data for given number of days
     */
    async getTimeline(days: number): Promise<TimelineData[]> {
        const result = await query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as created,
                COUNT(*) FILTER (WHERE current_status = 'COMPLETED') as completed,
                COUNT(*) FILTER (WHERE is_bottleneck = true) as bottlenecks
            FROM documents
            WHERE created_at >= NOW() - INTERVAL '1 day' * $1
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [days]);

        return result.rows.map(row => ({
            date: row.date,
            created: parseInt(row.created),
            completed: parseInt(row.completed),
            bottlenecks: parseInt(row.bottlenecks)
        }));
    }
};
