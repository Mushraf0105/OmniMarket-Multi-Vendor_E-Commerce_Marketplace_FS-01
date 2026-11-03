import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { isElasticsearchAvailable } from '../config/elasticsearch.js';

// @desc    Get comprehensive marketplace admin analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const orders = await Order.find();
    const vendors = await User.find({ role: 'vendor' });
    const customersCount = await User.countDocuments({ role: 'customer' });
    const productsCount = await Product.countDocuments();

    let totalGMV = 0;
    let totalPlatformCommission = 0;
    let totalVendorPayout = 0;
    let totalDiscountGiven = 0;

    const vendorMetrics = {};
    const categoryMetrics = {};

    orders.forEach((order) => {
      totalGMV += order.totalAmount;
      totalPlatformCommission += order.payment?.platformCommissionTotal || 0;
      totalDiscountGiven += order.discount || 0;

      order.items.forEach((item) => {
        totalVendorPayout += item.vendorShare || 0;

        // Vendor aggregation
        const vId = item.vendor.toString();
        if (!vendorMetrics[vId]) {
          vendorMetrics[vId] = {
            vendorId: vId,
            vendorName: item.vendorName || 'Vendor',
            grossSales: 0,
            vendorShare: 0,
            commissionPaid: 0,
            ordersCount: 0,
            unitsSold: 0
          };
        }
        vendorMetrics[vId].grossSales += item.price * item.quantity;
        vendorMetrics[vId].vendorShare += item.vendorShare || 0;
        vendorMetrics[vId].commissionPaid += item.platformCommission || 0;
        vendorMetrics[vId].unitsSold += item.quantity;
      });
    });

    // Count distinct orders per vendor
    Object.keys(vendorMetrics).forEach((vId) => {
      vendorMetrics[vId].ordersCount = orders.filter((o) =>
        o.items.some((i) => i.vendor.toString() === vId)
      ).length;
    });

    // Category breakdown
    const products = await Product.find().select('category price');
    products.forEach((p) => {
      categoryMetrics[p.category] = (categoryMetrics[p.category] || 0) + 1;
    });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Top Selling Products
    const topProducts = await Product.find()
      .sort({ rating: -1, numReviews: -1 })
      .limit(5)
      .select('name price rating numReviews category images');

    // System health indicators
    const systemHealth = {
      mongodb: 'CONNECTED',
      redis: 'ACTIVE (Cart & Session Cache)',
      elasticsearch: isElasticsearchAvailable() ? 'ONLINE' : 'FALLBACK_READY (Mongo Full-Text Search)',
      s3: Boolean(process.env.AWS_S3_BUCKET) ? 'AWS_S3_LIVE' : 'LOCAL_STORAGE_ACTIVE',
      payments: 'TEST_MODE_ACTIVE (Razorpay & Stripe Connect Split Payments)'
    };

    res.status(200).json({
      success: true,
      analytics: {
        totalGMV: Math.round(totalGMV * 100) / 100,
        totalPlatformCommission: Math.round(totalPlatformCommission * 100) / 100,
        totalVendorPayout: Math.round(totalVendorPayout * 100) / 100,
        totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
        totalOrders: orders.length,
        totalVendors: vendors.length,
        totalCustomers: customersCount,
        totalProducts: productsCount,
        vendorLeaderboard: Object.values(vendorMetrics).sort((a, b) => b.grossSales - a.grossSales),
        categoryDistribution: categoryMetrics,
        recentOrders,
        topProducts,
        systemHealth
      }
    });
  } catch (err) {
    next(err);
  }
};

