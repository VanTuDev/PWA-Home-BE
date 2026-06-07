import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Đăng ký: multipart/form-data với cccdFront + cccdBack
router.post('/register', upload.fields([
  { name: 'cccdFront', maxCount: 1 },
  { name: 'cccdBack',  maxCount: 1 },
]), register);

router.post('/login',            login);
router.put('/change-password',   protect, changePassword);
router.get('/profile',           protect, getProfile);
router.put('/profile',           protect, upload.fields([
  { name: 'avatar',     maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]), updateProfile);

export default router;
