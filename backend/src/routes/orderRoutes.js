import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  downloadOrderInvoice
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadOrderInvoice);
router.put('/:id/status', authorize('admin', 'vendor'), updateOrderStatus);

export default router;
