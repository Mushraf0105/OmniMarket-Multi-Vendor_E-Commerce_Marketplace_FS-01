import express from 'express';
import {
  onboardVendor,
  getVendorProfile,
  getAllVendors,
  getVendorDashboardStats,
  getVendorOrders,
  updateVendorOrderItemStatus
} from '../controllers/vendorController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', getAllVendors);
router.get('/profile/:id', getVendorProfile);
router.post('/onboard', protect, onboardVendor);
router.get('/dashboard/stats', protect, authorize('vendor', 'admin'), getVendorDashboardStats);
router.get('/orders', protect, authorize('vendor', 'admin'), getVendorOrders);
router.put('/orders/:orderId/items/:itemId/status', protect, authorize('vendor', 'admin'), updateVendorOrderItemStatus);

export default router;

