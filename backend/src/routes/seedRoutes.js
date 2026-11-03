import express from 'express';
import { seedDatabase } from '../scripts/seed.js';

const router = express.Router();

router.post('/run', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Demo database seeded successfully with users, categories, products, coupons, and orders.',
      details: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: err.message
    });
  }
});

export default router;

