import express from 'express';
import { 
  createAdoption, 
  getAdoptions, 
  updateAdoptionStatus, 
  addTrackingReport 
} from '../controllers/adoptionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createAdoption)
  .get(protect, getAdoptions);

router.route('/:id/status')
  .put(protect, authorize('admin', 'manager', 'staff'), updateAdoptionStatus);

router.route('/:id/tracking')
  .post(protect, upload.single('image'), addTrackingReport);

export default router;
