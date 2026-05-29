import express from 'express';
import { createPost, getPosts, likePost } from '../controllers/communityController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(getPosts);

router.route('/:id/like')
  .put(protect, likePost);

export default router;
