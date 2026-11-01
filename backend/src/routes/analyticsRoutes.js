import express from 'express';
import { getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

export default router;
