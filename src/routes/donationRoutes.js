import express from 'express';
import { createDonation, getDonations } from '../controllers/donationController.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional user context extractor for donations
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_pwa_home_token_key_123');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore error to allow anonymous donation
    }
  }
  next();
};

router.route('/')
  .post(optionalProtect, createDonation)
  .get(getDonations);

export default router;
