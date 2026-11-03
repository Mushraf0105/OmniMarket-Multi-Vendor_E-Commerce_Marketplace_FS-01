import {
  getCartFromCache,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  emptyCart
} from '../services/cartService.js';

// Helper to get Redis cache key
const getCartKey = (req) => {
  if (req.user) {
    return `cart:user:${req.user._id}`;
  }
  const sessionId = req.headers['x-session-id'] || req.ip || 'anonymous';
  return `cart:session:${sessionId}`;
};

// @desc    Get cart from Redis
// @route   GET /api/cart
// @access  Public / Private
export const getCart = async (req, res, next) => {
  try {
    const key = getCartKey(req);
    const cart = await getCartFromCache(key);
    res.status(200).json({
      success: true,
      cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart in Redis
// @route   POST /api/cart/add
// @access  Public / Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const key = getCartKey(req);
    const cart = await addItemToCart(key, { productId, quantity: Number(quantity) || 1 });

    res.status(200).json({
      success: true,
      message: 'Item added to Redis-cached cart.',
      cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item quantity in Redis cart
// @route   PUT /api/cart/update
// @access  Public / Private
export const updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const key = getCartKey(req);
    const cart = await updateItemQuantity(key, productId, Number(quantity));

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from Redis cart
// @route   DELETE /api/cart/remove/:productId
// @access  Public / Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const key = getCartKey(req);
    const cart = await removeItemFromCart(key, productId);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart in Redis
// @route   DELETE /api/cart/clear
// @access  Public / Private
export const clearCart = async (req, res, next) => {
  try {
    const key = getCartKey(req);
    const cart = await emptyCart(key);

    res.status(200).json({
      success: true,
      message: 'Cart cleared from Redis.',
      cart
    });
  } catch (err) {
    next(err);
  }
};

