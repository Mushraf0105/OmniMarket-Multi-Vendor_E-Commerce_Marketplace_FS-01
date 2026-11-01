import Coupon from '../models/Coupon.js';

// @desc    Validate coupon code and return discount
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const total = Number(cartTotal) || 0;
    if (total < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of $${coupon.minOrderValue} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (total * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.discountValue, total);
    }

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discount * 100) / 100,
        minOrderValue: coupon.minOrderValue
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin / Vendor)
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit
    } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 1000,
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: usageLimit ? Number(usageLimit) : 500,
      vendor: req.user.role === 'vendor' ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private (Admin)
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
