import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin middleware to all routes in this router
router.use(protect);
router.use(adminGuard);

router.route('/stats').get(getDashboardStats);

export default router;
