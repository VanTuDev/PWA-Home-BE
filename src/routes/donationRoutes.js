import express from 'express';
import {
  createDonation, createAdoptionDonation, checkAdoptionDonation,
  payosDonationWebhook, payosDonationReturn, getDonations, getMyDonations,
  createSystemDonation, uploadBillImage,
} from '../controllers/donationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {}
  }
  next();
};

// PayOS callbacks (no auth) — đặt trước route khác
router.get( '/payos_return',  payosDonationReturn);
router.post('/payos_webhook', payosDonationWebhook);

// Adoption donation
router.post('/adoption', protect, createAdoptionDonation);
router.get( '/check',    protect, checkAdoptionDonation);
router.get( '/my',       protect, getMyDonations);

router.post('/system', optionalProtect, createSystemDonation);
router.patch('/:id/bill', optionalProtect, uploadBillImage);

router.route('/')
  .post(optionalProtect, createDonation)
  .get(getDonations);

export default router;
