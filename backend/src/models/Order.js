import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorName: { type: String, default: 'Vendor' },
  vendorShare: { type: Number, required: true }, // Net payout to vendor (e.g. 90%)
  platformCommission: { type: Number, required: true }, // Marketplace platform commission (e.g. 10%)
  status: {
    type: String,
    enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  trackingNumber: { type: String, default: '' },
  shippingCarrier: { type: String, default: '' },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ]
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'USA' },
      phone: { type: String, required: true }
    },
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'stripe', 'mock_split_pay'],
        default: 'mock_split_pay'
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
      },
      transactionId: { type: String, default: '' },
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      stripePaymentIntentId: { type: String, default: '' },
      splitTransfers: [
        {
          vendorId: { type: String },
          vendorName: { type: String },
          amount: { type: Number },
          transferId: { type: String },
          status: { type: String, default: 'settled' }
        }
      ],
      platformCommissionTotal: { type: Number, default: 0 },
      paidAt: { type: Date, default: Date.now }
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponApplied: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 }
    },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    overallStatus: {
      type: String,
      enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ],
    invoiceNumber: { type: String }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Order', orderSchema);

