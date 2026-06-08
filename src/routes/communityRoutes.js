import express from 'express';
import {
  getPosts, createPost, updatePost, deletePost,
  toggleLike, addComment, deleteComment,
  sharePost, toggleSave
} from '../controllers/communityController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';
import { withUpload } from '../middlewares/uploadWrapper.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getPosts)
  .post(protect, withUpload('image'), createPost);

router.route('/:id')
  .put(protect,    withUpload('image'), updatePost)
  .delete(protect, deletePost);

router.put('/:id/like',  protect,  toggleLike);
router.put('/:id/share', sharePost);
router.put('/:id/save',  protect,  toggleSave);

router.post('/:id/comments',              protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
