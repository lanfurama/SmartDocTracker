import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { analyticsService } from '../../services';

const router = express.Router();

// GET /overview - Overview statistics
router.get('/overview', asyncHandler(async (req, res) => {
    const stats = await analyticsService.getOverview();
    res.json(stats);
}));

// GET /by-department - Analytics breakdown by department
router.get('/by-department', asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDepartmentBreakdown();
    res.json(stats);
}));

// GET /by-category - Analytics breakdown by category
router.get('/by-category', asyncHandler(async (req, res) => {
    const stats = await analyticsService.getCategoryBreakdown();
    res.json(stats);
}));

// GET /timeline?days=7 - Historical analytics over time
router.get('/timeline', asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const timeline = await analyticsService.getTimeline(days);
    res.json(timeline);
}));

export default router;
