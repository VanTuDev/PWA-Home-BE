import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'manager'), upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect,  authorize('admin', 'manager'), upload.single('image'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;
