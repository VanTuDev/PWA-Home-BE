import express from 'express';
import {
  getDashboardStats,
  getAnalyticsStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', protect, authorize('admin', 'manager', 'staff'), getDashboardStats);

// Analytics stats
router.get('/analytics', protect, authorize('admin', 'manager', 'staff'), getAnalyticsStats);

// User CRUD — admin only
router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/users/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router;
