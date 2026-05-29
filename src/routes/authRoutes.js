import express from 'express';
import { register, verifyOtp, login, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register',         register);
router.post('/verify-otp',       verifyOtp);
router.post('/login',            login);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.put('/change-password',   protect, changePassword);

export default router;
