import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { connectDB } from './src/config/db.js';
import { initElasticsearch } from './src/config/elasticsearch.js';
import './src/config/redis.js';
import './src/config/s3.js';
import './src/config/payments.js';

import authRoutes from './src/routes/authRoutes.js';
import vendorRoutes from './src/routes/vendorRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import seedRoutes from './src/routes/seedRoutes.js';

import { errorHandler } from './src/middleware/errorHandler.js';
import Product from './src/models/Product.js';
import { seedDatabase } from './src/scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API stability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'OmniMarket Multi-Vendor Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seed', seedRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server & Connect Services
const startServer = async () => {
  try {
    await connectDB();
    await initElasticsearch();

    // Auto-seed if products collection is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Server] Database is empty. Automatically populating initial seed catalog...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 OmniMarket Multi-Vendor API Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Seed API: POST http://localhost:${PORT}/api/seed/run`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
