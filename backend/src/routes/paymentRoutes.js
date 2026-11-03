import express from 'express';
import {
  previewSplitBreakdown,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate-split', previewSplitBreakdown);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/stripe/create-intent', protect, createStripePaymentIntent);

export default router;

