import express from 'express';
import { getMessages, markRead, getRooms } from '../controllers/chatController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, authorize('admin', 'manager', 'staff'), getRooms);
router.get('/:userId',       protect, getMessages);
router.put('/:userId/read',  protect, authorize('admin', 'manager', 'staff'), markRead);

export default router;
