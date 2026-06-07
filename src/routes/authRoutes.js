import express from 'express';
import { register, verifyOtp, login, forgotPassword, resetPassword, changePassword, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register',         register);
router.post('/verify-otp',       verifyOtp);
router.post('/login',            login);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.put('/change-password',   protect, changePassword);
router.get('/profile',           protect, getProfile);
router.put('/profile',           protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateProfile);

export default router;
