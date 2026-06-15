import express from 'express';
import { getBankInfo, updateBankInfo } from '../controllers/settingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/bank-info', getBankInfo);
router.put('/bank-info', protect, authorize('admin', 'manager'), updateBankInfo);

export default router;
