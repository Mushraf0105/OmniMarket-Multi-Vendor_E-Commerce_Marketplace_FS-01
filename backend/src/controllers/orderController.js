import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { calculateSplitBreakdown } from '../config/payments.js';
import { emptyCart } from '../services/cartService.js';
import { generateOrderInvoicePDF } from '../services/invoiceService.js';

// @desc    Create new Order with split payment calculation & inventory reservation
// @route   POST /api/orders
// @access  Private (Customer / Vendor / Admin)
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Incomplete shipping address' });
    }

    // Verify stock and fetch fresh product data
    const productIds = items.map((i) => i.productId || i.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } })
      .populate('vendor', 'name vendorProfile');

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const populatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const pId = (item.productId || item.product).toString();
      const dbProduct = productMap.get(pId);

      if (!dbProduct) {
        return res.status(400).json({ success: false, message: `Product not found: ${pId}` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${dbProduct.name}'. Available: ${dbProduct.stock}, requested: ${item.quantity}`
        });
      }

      const itemTotal = dbProduct.price * item.quantity;
      subtotal += itemTotal;

      populatedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.images[0] || '',
        price: dbProduct.price,
        quantity: Number(item.quantity),
        vendor: dbProduct.vendor._id,
        vendorName: dbProduct.vendor?.vendorProfile?.storeName || dbProduct.vendor?.name || 'Vendor',
        vendorCommissionRate: dbProduct.vendor?.vendorProfile?.commissionRate || 10,
        status: 'placed',
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date(),
            note: 'Order placed by customer.'
          }
        ]
      });
    }

    // Process Coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gte: new Date() }
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }

          appliedCoupon = {
            code: coupon.code,
            discountAmount: Math.round(discount * 100) / 100
          };

          // Increment usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Calculate marketplace split payment breakdown across vendors
    const splitCalc = calculateSplitBreakdown(populatedItems, 10, discount);

    // Populate vendorShare and platformCommission for each item
    populatedItems.forEach((item) => {
      const splitInfo = splitCalc.splits.find((s) => s.vendorId === item.vendor.toString());
      const itemProportion = splitInfo ? (item.price * item.quantity) / (splitInfo.grossAmount || 1) : 1;
      item.vendorShare = splitInfo ? Math.round(splitInfo.vendorShare * itemProportion * 100) / 100 : item.price * 0.9;
      item.platformCommission = splitInfo ? Math.round(splitInfo.platformCommission * itemProportion * 100) / 100 : item.price * 0.1;
    });

    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100; // 8% sales tax
    const shippingFee = subtotal > 100 ? 0 : 10; // Free shipping over ₹100
    const totalAmount = Math.round((subtotal - discount + tax + shippingFee) * 100) / 100;

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: populatedItems,
      shippingAddress,
      payment: {
        method: paymentMethod || 'mock_split_pay',
        status: 'completed',
        transactionId: `TXN-${Date.now()}`,
        splitTransfers: splitCalc.splits.map((s) => ({
          vendorId: s.vendorId,
          vendorName: s.vendorName,
          amount: s.vendorShare,
          transferId: `TRF-${Date.now()}-${s.vendorId.slice(-4)}`,
          status: 'settled'
        })),
        platformCommissionTotal: splitCalc.totalCommission,
        paidAt: new Date()
      },
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      couponApplied: appliedCoupon,
      tax,
      shippingFee,
      totalAmount,
      overallStatus: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order successfully created and paid.'
        }
      ],
      invoiceNumber: `INV-${orderNumber.replace('ORD-', '')}`
    });

    // Deduct stock for ordered items
    for (const item of populatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear Redis cart for user
    await emptyCart(`cart:user:${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully with automatic marketplace split settlement.',
      order,
      splitSummary: splitCalc
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow customer who placed the order, vendors included in order, or admin
    const isCustomer = order.customer._id.toString() === req.user.id.toString();
    const isVendor = order.items.some((i) => i.vendor.toString() === req.user.id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order lifecycle status (Admin / Vendor)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin / Vendor)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.overallStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    // Also update all items if admin updates overall status
    if (req.user.role === 'admin') {
      order.items.forEach((item) => {
        item.status = status;
        item.statusHistory.push({
          status,
          timestamp: new Date(),
          note: `Status synchronized to ${status} by Admin.`
        });
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download PDF invoice for order
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadOrderInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer._id.toString() === req.user.id.toString();
    const isVendor = order.items.some((i) => i.vendor.toString() === req.user.id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Invoice-${order.orderNumber}.pdf`
    );

    generateOrderInvoicePDF(order, res);
  } catch (err) {
    next(err);
  }
};

