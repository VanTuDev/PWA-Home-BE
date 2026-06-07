import express from 'express';
import { createOrder, getOrders, updateOrderStatus, payosReturn, payosWebhook } from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PayOS callbacks (no auth) — phải đặt trước /:id
router.get( '/payos_return',  payosReturn);   // redirect khách sau thanh toán
router.post('/payos_webhook', payosWebhook);  // server-to-server webhook

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateOrderStatus);

export default router;
