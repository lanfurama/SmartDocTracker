import cron from 'node-cron';
import { documentService } from '../services';
import { logger } from '../utils/logger';

/**
 * Bottleneck Detection Job
 * Runs every hour to update is_bottleneck flag for documents
 * that have been in the same status for more than 24 hours
 */

const BOTTLENECK_THRESHOLD_HOURS = 24;

export const updateBottlenecks = async (): Promise<void> => {
    try {
        const result = await documentService.updateBottleneckFlags(BOTTLENECK_THRESHOLD_HOURS);

        logger.info('Bottleneck detection completed', {
            totalUpdated: result.totalUpdated,
            newBottlenecks: result.newBottlenecks,
            threshold: BOTTLENECK_THRESHOLD_HOURS
        });
    } catch (error) {
        logger.error('Bottleneck detection failed', { error });
    }
};

// Schedule to run every hour
export const startBottleneckDetection = () => {
    // Run immediately on startup
    updateBottlenecks();

    // Schedule hourly
    cron.schedule('0 * * * *', async () => {
        logger.info('Running scheduled bottleneck detection');
        await updateBottlenecks();
    });

    logger.info('Bottleneck detection scheduler started');
};
