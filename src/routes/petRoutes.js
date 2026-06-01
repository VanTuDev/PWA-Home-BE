import express from 'express';
import { getPets, getPetById, createPet, updatePet, deletePet, matchPets } from '../controllers/petController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/match', matchPets);

router.route('/')
  .get(getPets)
  .post(protect, authorize('admin'), upload.single('image'), createPet);

router.route('/:id')
  .get(getPetById)
  .put(protect, authorize('admin', 'manager'), upload.single('image'), updatePet)
  .delete(protect, authorize('admin'), deletePet);

export default router;
