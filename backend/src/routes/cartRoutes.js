import express from 'express';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional auth middleware so cart works seamlessly for guests and logged in users
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_for_assessment_fs01_2026');
      req.user = await User.findById(decoded.id);
    } catch (e) {}
  }
  next();
};

router.use(optionalAuth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCart);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;

