import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitBreakdown } from '../src/config/payments.js';

test('Marketplace Split Payments: 10% Platform Commission and 90% Vendor Payout', () => {
  const items = [
    {
      product: 'prod_1',
      price: 100,
      quantity: 2,
      vendor: 'vendor_1',
      vendorName: 'Apex Electronics'
    }
  ];

  const breakdown = calculateSplitBreakdown(items, 10, 0);

  assert.equal(breakdown.totalGross, 200);
  assert.equal(breakdown.totalCommission, 20); // 10% of 200
  assert.equal(breakdown.totalVendorPayout, 180); // 90% of 200
  assert.equal(breakdown.splits.length, 1);
  assert.equal(breakdown.splits[0].vendorShare, 180);
  assert.equal(breakdown.splits[0].platformCommission, 20);
});

test('Marketplace Multi-Vendor Split: Independent Vendors in Single Cart', () => {
  const items = [
    {
      product: 'p1',
      price: 50,
      quantity: 2, // $100 total
      vendor: 'vendor_tech',
      vendorName: 'Tech Store'
    },
    {
      product: 'p2',
      price: 200,
      quantity: 1, // $200 total
      vendor: 'vendor_fashion',
      vendorName: 'Fashion Store'
    }
  ];

  const breakdown = calculateSplitBreakdown(items, 10, 0);

  assert.equal(breakdown.totalGross, 300);
  assert.equal(breakdown.totalCommission, 30); // 10% of 300
  assert.equal(breakdown.totalVendorPayout, 270); // 90% of 300
  assert.equal(breakdown.splits.length, 2);

  const techSplit = breakdown.splits.find((s) => s.vendorId === 'vendor_tech');
  assert.equal(techSplit.grossAmount, 100);
  assert.equal(techSplit.platformCommission, 10);
  assert.equal(techSplit.vendorShare, 90);

  const fashionSplit = breakdown.splits.find((s) => s.vendorId === 'vendor_fashion');
  assert.equal(fashionSplit.grossAmount, 200);
  assert.equal(fashionSplit.platformCommission, 20);
  assert.equal(fashionSplit.vendorShare, 180);
});

test('Marketplace Split with Promotional Coupon Discount Pro-rated Across Vendors', () => {
  const items = [
    {
      product: 'p1',
      price: 100,
      quantity: 1, // 1/3 of total
      vendor: 'v1',
      vendorName: 'Vendor One'
    },
    {
      product: 'p2',
      price: 200,
      quantity: 1, // 2/3 of total
      vendor: 'v2',
      vendorName: 'Vendor Two'
    }
  ];

  const discount = 30; // $30 total coupon discount
  const breakdown = calculateSplitBreakdown(items, 10, discount);

  assert.equal(breakdown.totalGross, 300);
  assert.equal(breakdown.totalDiscount, 30);
  // v1 net gross: 100 - 10 = 90. 10% commission = 9. Net vendor share = 81.
  // v2 net gross: 200 - 20 = 180. 10% commission = 18. Net vendor share = 162.
  assert.equal(breakdown.totalCommission, 27);
  assert.equal(breakdown.totalVendorPayout, 243);
});
