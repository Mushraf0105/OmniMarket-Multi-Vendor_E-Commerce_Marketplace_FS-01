import Razorpay from 'razorpay';
import Stripe from 'stripe';

let razorpayInstance = null;
let stripeInstance = null;

export const initPaymentGateways = () => {
  const rzpKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_assessmentDemo123';
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_assessmentDemoKey456';
  
  try {
    razorpayInstance = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret
    });
    console.log('[Payments] Razorpay test gateway initialized.');
  } catch (err) {
    console.warn('[Payments] Razorpay initialization warning:', err.message);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mockStripeSecretKey987654321';
  try {
    stripeInstance = new Stripe(stripeKey);
    console.log('[Payments] Stripe Connect gateway initialized.');
  } catch (err) {
    console.warn('[Payments] Stripe initialization warning:', err.message);
  }
};

initPaymentGateways();

/**
 * Calculates marketplace split payment breakdown:
 * - Aggregates amounts by vendor
 * - Calculates platform commission fee (e.g. 10%)
 * - Calculates net vendor payout (e.g. 90%)
 */
export const calculateSplitBreakdown = (items, defaultCommission = 10, discount = 0) => {
  const vendorBreakdown = {};
  let totalGross = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    totalGross += itemTotal;
    const vendorId = item.vendor?._id ? item.vendor._id.toString() : item.vendor.toString();
    const vendorName = item.vendorName || 'Vendor';
    const commissionRate = item.vendor?.vendorProfile?.commissionRate ?? defaultCommission;

    if (!vendorBreakdown[vendorId]) {
      vendorBreakdown[vendorId] = {
        vendorId,
        vendorName,
        commissionRate,
        grossAmount: 0,
        itemsCount: 0,
        vendorShare: 0,
        platformCommission: 0
      };
    }

    vendorBreakdown[vendorId].grossAmount += itemTotal;
    vendorBreakdown[vendorId].itemsCount += item.quantity;
  }

  // Adjust for discount proportionally across vendors
  let totalCommission = 0;
  let totalVendorPayout = 0;

  const splits = Object.values(vendorBreakdown).map((vb) => {
    const proportion = totalGross > 0 ? vb.grossAmount / totalGross : 0;
    const allocatedDiscount = discount * proportion;
    const netVendorGross = Math.max(0, vb.grossAmount - allocatedDiscount);

    const platformFee = Math.round((netVendorGross * (vb.commissionRate / 100)) * 100) / 100;
    const vendorNet = Math.round((netVendorGross - platformFee) * 100) / 100;

    vb.allocatedDiscount = Math.round(allocatedDiscount * 100) / 100;
    vb.netGross = netVendorGross;
    vb.platformCommission = platformFee;
    vb.vendorShare = vendorNet;

    totalCommission += platformFee;
    totalVendorPayout += vendorNet;

    return vb;
  });

  return {
    totalGross,
    totalDiscount: discount,
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalVendorPayout: Math.round(totalVendorPayout * 100) / 100,
    splits
  };
};

export const getRazorpayInstance = () => razorpayInstance;
export const getStripeInstance = () => stripeInstance;

