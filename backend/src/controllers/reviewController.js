import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private (Customer)
export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product'
      });
    }

    // Verify if customer has purchased this product
    const hasPurchased = await Order.findOne({
      customer: req.user.id,
      'items.product': productId
    });

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: Boolean(hasPurchased)
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

