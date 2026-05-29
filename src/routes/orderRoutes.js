import express from 'express';
import { createOrder, getOrders, updateOrderStatus, vnpayReturn, vnpayIpn } from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// VNPay callbacks (no auth)
router.get('/vnpay_return', vnpayReturn);   // redirect khách hàng
router.get('/vnpay_ipn',    vnpayIpn);      // server-to-server IPN

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateOrderStatus);

export default router;
