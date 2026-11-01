import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Onboard / Update Vendor Profile
// @route   POST /api/vendors/onboard
// @access  Private (Vendor / Admin)
export const onboardVendor = async (req, res, next) => {
  try {
    const {
      storeName,
      description,
      banner,
      logo,
      bankDetails,
      stripeAccountId,
      razorpayAccountId,
      phone
    } = req.body;

    const slug = (storeName || req.user.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: 'vendor',
        phone: phone || req.user.phone,
        vendorProfile: {
          storeName: storeName || `${req.user.name}'s Store`,
          slug,
          description: description || 'Premium verified vendor on OmniMarket.',
          banner: banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          logo: logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80',
          commissionRate: req.user.vendorProfile?.commissionRate || 10,
          isApproved: true,
          bankDetails: bankDetails || req.user.vendorProfile?.bankDetails || {},
          stripeAccountId: stripeAccountId || req.user.vendorProfile?.stripeAccountId || '',
          razorpayAccountId: razorpayAccountId || req.user.vendorProfile?.razorpayAccountId || ''
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vendor store profile updated successfully.',
      vendor: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Public Profile and active products
// @route   GET /api/vendors/:id
// @access  Public
export const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const products = await Product.find({ vendor: vendor._id, isPublished: true });

    res.status(200).json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        profile: vendor.vendorProfile
      },
      productsCount: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all vendors (Admin & Public directory)
// @route   GET /api/vendors
// @access  Public
export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Dashboard Statistics
// @route   GET /api/vendors/dashboard/stats
// @access  Private (Vendor)
export const getVendorDashboardStats = async (req, res, next) => {
  try {
    const vendorId = req.user.id;

    // Fetch all orders containing this vendor's items
    const orders = await Order.find({ 'items.vendor': vendorId });

    let totalGrossSales = 0;
    let netVendorEarnings = 0;
    let totalPlatformCommission = 0;
    let itemsSold = 0;
    let pendingFulfillmentCount = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.vendor.toString() === vendorId.toString()) {
          const itemTotal = item.price * item.quantity;
          totalGrossSales += itemTotal;
          netVendorEarnings += item.vendorShare;
          totalPlatformCommission += item.platformCommission;
          itemsSold += item.quantity;

          if (['placed', 'packed'].includes(item.status)) {
            pendingFulfillmentCount++;
          }
        }
      });
    });

    const productsCount = await Product.countDocuments({ vendor: vendorId });

    res.status(200).json({
      success: true,
      stats: {
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        netVendorEarnings: Math.round(netVendorEarnings * 100) / 100,
        totalPlatformCommission: Math.round(totalPlatformCommission * 100) / 100,
        totalOrders: orders.length,
        itemsSold,
        pendingFulfillmentCount,
        productsCount,
        commissionRate: req.user.vendorProfile?.commissionRate || 10
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor's Orders (filtered to items belonging to this vendor)
// @route   GET /api/vendors/orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const orders = await Order.find({ 'items.vendor': vendorId })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter items inside each order so vendor only sees their own items and payouts
    const vendorOrders = orders.map((order) => {
      const vendorItems = order.items.filter(
        (i) => i.vendor.toString() === vendorId.toString()
      );

      const vendorItemTotal = vendorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const vendorNetShare = vendorItems.reduce(
        (sum, item) => sum + item.vendorShare,
        0
      );
      const commission = vendorItems.reduce(
        (sum, item) => sum + item.platformCommission,
        0
      );

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.payment.status,
        paymentMethod: order.payment.method,
        createdAt: order.createdAt,
        items: vendorItems,
        vendorItemTotal: Math.round(vendorItemTotal * 100) / 100,
        vendorNetShare: Math.round(vendorNetShare * 100) / 100,
        commission: Math.round(commission * 100) / 100
      };
    });

    res.status(200).json({
      success: true,
      count: vendorOrders.length,
      orders: vendorOrders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Vendor updates status of their item in an order (packed, shipped, delivered)
// @route   PUT /api/vendors/orders/:orderId/items/:itemId/status
// @access  Private (Vendor / Admin)
export const updateVendorOrderItemStatus = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { status, trackingNumber, shippingCarrier, note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Order item not found' });
    }

    // Verify vendor ownership or admin
    if (req.user.role !== 'admin' && item.vendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update items belonging to another vendor'
      });
    }

    item.status = status;
    if (trackingNumber) item.trackingNumber = trackingNumber;
    if (shippingCarrier) item.shippingCarrier = shippingCarrier;

    item.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Item marked as ${status} by vendor ${req.user.name}`
    });

    // Check if overall order status should be updated
    const allStatuses = order.items.map((i) => i.status);
    if (allStatuses.every((s) => s === 'delivered')) {
      order.overallStatus = 'delivered';
    } else if (allStatuses.some((s) => s === 'shipped')) {
      order.overallStatus = 'shipped';
    } else if (allStatuses.some((s) => s === 'packed')) {
      order.overallStatus = 'packed';
    }

    order.statusHistory.push({
      status: order.overallStatus,
      timestamp: new Date(),
      note: `Order status updated to ${order.overallStatus}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Item status updated to '${status}'.`,
      order
    });
  } catch (err) {
    next(err);
  }
};
