import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { withUploadFields } from '../middlewares/uploadWrapper.js';

const router = express.Router();

router.post('/register', withUploadFields([
  { name: 'cccdFront', maxCount: 1 },
  { name: 'cccdBack',  maxCount: 1 },
]), register);

router.post('/login',            login);
router.put('/change-password',   protect, changePassword);
router.get('/profile',           protect, getProfile);
router.put('/profile',           protect, withUploadFields([
  { name: 'avatar',     maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]), updateProfile);

export default router;
