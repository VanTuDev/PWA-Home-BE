import express from 'express';
import {
  getPosts, createPost, updatePost, deletePost,
  toggleLike, addComment, deleteComment,
  sharePost, toggleSave
} from '../controllers/communityController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .put(protect,    upload.single('image'), updatePost)
  .delete(protect, deletePost);

router.put('/:id/like',  protect,  toggleLike);
router.put('/:id/share', sharePost);              // public — không cần login
router.put('/:id/save',  protect,  toggleSave);

router.post('/:id/comments',                      protect, addComment);
router.delete('/:id/comments/:commentId',         protect, deleteComment);

export default router;
