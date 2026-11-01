import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 1000
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null means platform-wide coupon
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 1000
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Coupon', couponSchema);
