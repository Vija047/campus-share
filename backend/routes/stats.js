import express from 'express';
import {
    getDashboardStats,
    getLeaderboard,
    getGeneralStats
} from '../controllers/statsController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/dashboard', authenticate, getDashboardStats);
router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/general', optionalAuth, getGeneralStats);

export default router;
