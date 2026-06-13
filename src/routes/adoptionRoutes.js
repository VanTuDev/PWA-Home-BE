import express from 'express';
import {
  createAdoption,
  getAdoptions,
  updateAdoptionStatus,
  addTrackingReport,
  getMyTasks,
} from '../controllers/adoptionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { getOverdueAdoptions, checkAndWarnOverdueTasks } from '../services/taskWarningService.js';

const router = express.Router();

router.get('/my-tasks', protect, getMyTasks);

// Admin: lấy danh sách adoption quá hạn nhiệm vụ
router.get('/overdue', protect, authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const list = await getOverdueAdoptions();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
});

// Admin: trigger gửi cảnh báo ngay lập tức (manual)
router.post('/warn-overdue', protect, authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    await checkAndWarnOverdueTasks();
    return res.json({ message: 'Đã gửi cảnh báo cho người dùng quá hạn.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
});

router.route('/')
  .post(protect, createAdoption)
  .get(protect, getAdoptions);

router.route('/:id/status')
  .put(protect, authorize('admin', 'manager', 'staff'), updateAdoptionStatus);

router.route('/:id/tracking')
  .post(protect, upload.single('image'), addTrackingReport);

export default router;
