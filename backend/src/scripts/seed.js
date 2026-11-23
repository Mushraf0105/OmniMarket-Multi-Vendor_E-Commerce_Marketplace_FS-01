import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { indexProductInES } from '../config/elasticsearch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();
  await Review.deleteMany();
  await Coupon.deleteMany();

  console.log('[Seed] Creating demo users...');
  const admin = await User.create({
    name: 'Platform Administrator',
    email: 'admin@omnimarket.io',
    password: 'Password@123',
    role: 'admin',
    phone: '+1-800-555-0100',
    address: { street: '100 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' }
  });

  const vendor1 = await User.create({
    name: 'Apex Tech Solutions',
    email: 'techvendor@omnimarket.io',
    password: 'Password@123',
    role: 'vendor',
    phone: '+1-800-555-0101',
    address: { street: '250 Innovation Blvd', city: 'San Jose', state: 'CA', zipCode: '95112', country: 'USA' },
    vendorProfile: {
      storeName: 'Apex Electronics',
      slug: 'apex-electronics',
      description: 'Official flagship store for cutting-edge consumer electronics and audio gear.',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      commissionRate: 10,
      isApproved: true,
      bankDetails: {
        accountHolder: 'Apex Tech LLC',
        accountNumber: '987654321012',
        routingOrIfsc: '021000021',
        bankName: 'Silicon Valley Commercial Bank'
      }
    }
  });

  const vendor2 = await User.create({
    name: 'Urban Stitch Studio',
    email: 'fashionvendor@omnimarket.io',
    password: 'Password@123',
    role: 'vendor',
    phone: '+1-800-555-0102',
    address: { street: '42 Fashion Ave', city: 'New York', state: 'NY', zipCode: '10018', country: 'USA' },
    vendorProfile: {
      storeName: 'Urban Chic Apparel',
      slug: 'urban-chic-apparel',
      description: 'Modern, sustainable designer fashion, footwear, and handcrafted leather accessories.',
      banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80',
      commissionRate: 12,
      isApproved: true,
      bankDetails: {
        accountHolder: 'Urban Stitch Inc',
        accountNumber: '112233445566',
        routingOrIfsc: '026009593',
        bankName: 'Empire State Bank'
      }
    }
  });

  const vendor3 = await User.create({
    name: 'EcoLiving Collective',
    email: 'homevendor@omnimarket.io',
    password: 'Password@123',
    role: 'vendor',
    phone: '+1-800-555-0103',
    address: { street: '78 Pine Forest Way', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' },
    vendorProfile: {
      storeName: 'EcoHome Essentials',
      slug: 'ecohome-essentials',
      description: 'Artisan home décor, organic kitchenware, and sustainable living products.',
      banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80',
      commissionRate: 8,
      isApproved: true,
      bankDetails: {
        accountHolder: 'EcoLiving Co.',
        accountNumber: '556677889900',
        routingOrIfsc: '123000220',
        bankName: 'Pacific Northwest Community Bank'
      }
    }
  });

  const customer = await User.create({
    name: 'Alex Johnson',
    email: 'customer@omnimarket.io',
    password: 'Password@123',
    role: 'customer',
    phone: '+1-555-234-5678',
    address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zipCode: '62704', country: 'USA' }
  });

  console.log('[Seed] Creating categories...');
  const categories = await Category.create([
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Audio gear, computing, smart devices, and accessories',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Apparel, activewear, leather goods, and watches',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture, kitchen essentials, and ambient lighting',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Health & Beauty',
      slug: 'health-beauty',
      description: 'Skincare, wellness essentials, and personal care',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Fitness equipment, camping, and sports wear',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  console.log('[Seed] Creating products across vendors...');
  const productsData = [
    // Apex Electronics
    {
      name: 'AcousticMax Pro Active Noise-Cancelling Headphones',
      slug: 'acousticmax-pro-anc-headphones',
      description: 'Premium wireless over-ear headphones with 40-hour battery life, spatial audio, and studio-grade high-resolution drivers.',
      price: 249.99,
      compareAtPrice: 299.99,
      category: 'Electronics',
      brand: 'AcousticMax',
      stock: 45,
      rating: 4.8,
      numReviews: 28,
      vendor: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['audio', 'wireless', 'bluetooth', 'noise-cancelling']
    },
    {
      name: 'UltraWide Curved 34-Inch 165Hz Gaming Monitor',
      slug: 'ultrawide-curved-34-gaming-monitor',
      description: 'Immersive WQHD 3440x1440 display with HDR400, 1ms response time, USB-C 90W power delivery, and dual HDMI 2.1.',
      price: 499.00,
      compareAtPrice: 599.00,
      category: 'Electronics',
      brand: 'ApexVision',
      stock: 18,
      rating: 4.7,
      numReviews: 14,
      vendor: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['monitor', 'gaming', 'display', 'curved', '4k']
    },
    {
      name: 'MechMaster RGB Mechanical Wireless Keyboard',
      slug: 'mechmaster-rgb-mechanical-keyboard',
      description: 'Hot-swappable custom mechanical switches with per-key RGB backlighting, aircraft aluminum frame, and multi-device Bluetooth.',
      price: 119.50,
      compareAtPrice: 149.00,
      category: 'Electronics',
      brand: 'ApexGear',
      stock: 60,
      rating: 4.6,
      numReviews: 32,
      vendor: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['keyboard', 'mechanical', 'gaming', 'wireless']
    },
    {
      name: 'SmartTrack Fit Pro GPS Smartwatch',
      slug: 'smarttrack-fit-pro-smartwatch',
      description: 'Advanced health metrics with ECG, SpO2, heart rate variability, multi-band GPS, and 14-day battery life.',
      price: 189.00,
      compareAtPrice: 229.00,
      category: 'Electronics',
      brand: 'ApexTech',
      stock: 35,
      rating: 4.5,
      numReviews: 19,
      vendor: vendor1._id,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['smartwatch', 'fitness', 'wearable', 'gps']
    },

    // Urban Chic Apparel
    {
      name: 'Handcrafted Italian Full-Grain Leather Jacket',
      slug: 'handcrafted-italian-leather-jacket',
      description: 'Timeless tailored cafe racer leather jacket made from premium vegetable-tanned cowhide with brass hardware.',
      price: 349.00,
      compareAtPrice: 450.00,
      category: 'Fashion',
      brand: 'Urban Chic',
      stock: 22,
      rating: 4.9,
      numReviews: 41,
      vendor: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['jacket', 'leather', 'outerwear', 'menswear', 'luxury']
    },
    {
      name: 'Sustainable Organic Merino Wool Knit Sweater',
      slug: 'sustainable-organic-merino-wool-sweater',
      description: 'Ultra-soft, breathable 100% extra-fine Merino wool crewneck knit designed for effortless seasonal layering.',
      price: 89.00,
      compareAtPrice: 115.00,
      category: 'Fashion',
      brand: 'Urban Chic',
      stock: 50,
      rating: 4.7,
      numReviews: 23,
      vendor: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['sweater', 'wool', 'sustainable', 'apparel']
    },
    {
      name: 'Heritage Waterproof Canvas Weekender Duffel Bag',
      slug: 'heritage-waterproof-canvas-weekender-bag',
      description: 'Heavyweight waxed canvas travel duffel with reinforced leather handles, brass zippers, and separate shoe compartment.',
      price: 135.00,
      compareAtPrice: 170.00,
      category: 'Fashion',
      brand: 'Urban Chic',
      stock: 30,
      rating: 4.8,
      numReviews: 18,
      vendor: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['bag', 'travel', 'leather', 'canvas', 'duffel']
    },
    {
      name: 'Minimalist Titanium Automatic Chronograph Watch',
      slug: 'minimalist-titanium-chronograph-watch',
      description: 'Sleek brushed titanium casing, sapphire crystal face, Japanese automatic movement, and interchangeable leather strap.',
      price: 279.00,
      compareAtPrice: 350.00,
      category: 'Fashion',
      brand: 'Chronos',
      stock: 15,
      rating: 4.9,
      numReviews: 36,
      vendor: vendor2._id,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['watch', 'luxury', 'chronograph', 'accessories']
    },

    // EcoHome Essentials
    {
      name: 'Artisan Hand-Poured Ceramic Pour-Over Coffee Set',
      slug: 'artisan-ceramic-pour-over-coffee-set',
      description: 'Wheel-thrown stoneware dripper with heat-resistant borosilicate glass carafe and bamboo serving tray.',
      price: 68.00,
      compareAtPrice: 85.00,
      category: 'Home & Living',
      brand: 'EcoHome',
      stock: 40,
      rating: 4.8,
      numReviews: 29,
      vendor: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['coffee', 'kitchen', 'ceramic', 'artisan']
    },
    {
      name: 'Scandinavian Minimalist Solid Oak Nightstand',
      slug: 'scandinavian-solid-oak-nightstand',
      description: 'FSC-certified solid European white oak bedside table with soft-close drawer and natural matte oil finish.',
      price: 219.00,
      compareAtPrice: 280.00,
      category: 'Home & Living',
      brand: 'EcoHome',
      stock: 12,
      rating: 4.6,
      numReviews: 11,
      vendor: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1532372998445-5f6e838477c8?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['furniture', 'wood', 'oak', 'bedroom', 'scandinavian']
    },
    {
      name: 'Aromatherapy Ultrasonic Marble Essential Oil Diffuser',
      slug: 'aromatherapy-ultrasonic-marble-diffuser',
      description: 'Hand-carved natural Italian marble cover with whisper-quiet ultrasonic atomization and warm ambient LED lighting.',
      price: 75.00,
      compareAtPrice: 95.00,
      category: 'Home & Living',
      brand: 'EcoHome',
      stock: 35,
      rating: 4.7,
      numReviews: 25,
      vendor: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['wellness', 'aromatherapy', 'diffuser', 'marble']
    },
    {
      name: 'Organic Plant-Based Vitamin C Brightening Serum',
      slug: 'organic-vitamin-c-brightening-serum',
      description: 'Cold-pressed botanical serum with 20% stabilized Vitamin C, hyaluronic acid, and ferulic acid for radiant skin.',
      price: 42.00,
      compareAtPrice: 55.00,
      category: 'Health & Beauty',
      brand: 'PureBotanicals',
      stock: 80,
      rating: 4.9,
      numReviews: 54,
      vendor: vendor3._id,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
      ],
      tags: ['skincare', 'organic', 'serum', 'beauty']
    }
  ];

  const createdProducts = await Product.create(productsData);

  // Index in Elasticsearch
  for (const prod of createdProducts) {
    await prod.populate('vendor', 'name vendorProfile');
    await indexProductInES(prod);
  }

  console.log('[Seed] Creating promotional coupons...');
  await Coupon.create([
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 50,
      maxDiscount: 50,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 1000
    },
    {
      code: 'MEGA50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 250,
      maxDiscount: 50,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 500
    },
    {
      code: 'FESTIVE20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 100,
      maxDiscount: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 200
    }
  ]);

  console.log('[Seed] Creating reviews...');
  await Review.create([
    {
      product: createdProducts[0]._id,
      user: customer._id,
      userName: customer.name,
      rating: 5,
      title: 'Incredible sound clarity and battery life',
      comment: 'These headphones blew my expectations away. Active noise cancelling completely silences airplane hum and office chatter.',
      isVerifiedPurchase: true
    },
    {
      product: createdProducts[4]._id,
      user: customer._id,
      userName: customer.name,
      rating: 5,
      title: 'Top tier craftsmanship',
      comment: 'The leather smells amazing and the cut is perfect. Fits true to size with wonderful weight.',
      isVerifiedPurchase: true
    }
  ]);

  console.log('[Seed] Creating demo multi-vendor order with split settlements...');
  // Multi-vendor order containing item from vendor1 and vendor2
  const orderItems = [
    {
      product: createdProducts[0]._id,
      name: createdProducts[0].name,
      image: createdProducts[0].images[0],
      price: createdProducts[0].price,
      quantity: 1,
      vendor: vendor1._id,
      vendorName: 'Apex Electronics',
      vendorShare: 224.99, // 90% payout to vendor1
      platformCommission: 25.00, // 10% platform fee
      status: 'delivered',
      trackingNumber: 'TRK-98234710',
      shippingCarrier: 'FedEx Express',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Order placed' },
        { status: 'packed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Packed at Apex Warehouse' },
        { status: 'shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Dispatched via FedEx' },
        { status: 'delivered', timestamp: new Date(), note: 'Delivered to customer front porch' }
      ]
    },
    {
      product: createdProducts[5]._id,
      name: createdProducts[5].name,
      image: createdProducts[5].images[0],
      price: createdProducts[5].price,
      quantity: 1,
      vendor: vendor2._id,
      vendorName: 'Urban Chic Apparel',
      vendorShare: 78.32, // 88% payout to vendor2 (12% commission)
      platformCommission: 10.68, // 12% platform fee
      status: 'shipped',
      trackingNumber: 'USPS-44910283',
      shippingCarrier: 'USPS Priority',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Order placed' },
        { status: 'packed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Packed at NYC studio' },
        { status: 'shipped', timestamp: new Date(), note: 'In transit to Springfield' }
      ]
    }
  ];

  await Order.create({
    orderNumber: 'ORD-20261101-1001',
    customer: customer._id,
    items: orderItems,
    shippingAddress: {
      fullName: customer.name,
      addressLine1: customer.address?.street || '742 Evergreen Terrace',
      addressLine2: '',
      city: customer.address?.city || 'Springfield',
      state: customer.address?.state || 'IL',
      postalCode: customer.address?.zipCode || '62704',
      country: customer.address?.country || 'USA',
      phone: customer.phone || '+1-555-234-5678'
    },
    payment: {
      method: 'razorpay',
      status: 'completed',
      transactionId: 'TXN-RZP-998811',
      razorpayOrderId: 'order_rzp_mock_1001',
      razorpayPaymentId: 'pay_rzp_mock_998811',
      splitTransfers: [
        { vendorId: vendor1._id.toString(), vendorName: 'Apex Electronics', amount: 224.99, transferId: 'TRF-APEX-01', status: 'settled' },
        { vendorId: vendor2._id.toString(), vendorName: 'Urban Chic Apparel', amount: 78.32, transferId: 'TRF-URBAN-02', status: 'settled' }
      ],
      platformCommissionTotal: 35.68,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    subtotal: 338.99,
    discount: 10.00,
    couponApplied: { code: 'WELCOME10', discountAmount: 10.00 },
    tax: 26.32,
    shippingFee: 0,
    totalAmount: 355.31,
    overallStatus: 'shipped',
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Order paid with Razorpay' },
      { status: 'packed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Vendors prepared packages' },
      { status: 'shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Packages in transit' }
    ],
    invoiceNumber: 'INV-20261101-1001'
  });

  console.log('[Seed] Database successfully seeded with demo multi-vendor data!');
  return {
    users: { admin, vendor1, vendor2, vendor3, customer },
    productsCount: createdProducts.length
  };
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectDB().then(async () => {
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}
