import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategories
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories/all', getCategories);
router.get('/:idOrSlug', getProductById);
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);
router.post(
  '/upload-image',
  protect,
  authorize('vendor', 'admin'),
  upload.single('image'),
  uploadProductImage
);

export default router;

