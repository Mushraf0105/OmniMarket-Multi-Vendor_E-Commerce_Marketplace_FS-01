import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin', 'vendor'), createCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
