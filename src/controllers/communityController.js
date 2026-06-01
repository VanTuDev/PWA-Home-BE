import mongoose from 'mongoose';
import Post from '../models/Post.js';

const toDTO = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  return {
    ...obj,
    likeCount:    (obj.likedBy   || []).length,
    commentCount: (obj.commentList || []).length,
    isLiked:  userId ? (obj.likedBy  || []).some(id => id?.toString() === userId?.toString()) : false,
    isSaved:  userId ? (obj.savedBy  || []).some(id => id?.toString() === userId?.toString()) : false,
    isOwner:  userId ? obj.userId?.toString() === userId?.toString() : false
  };
};

// @desc  GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filter = req.query.tab === 'saved' && userId ? { savedBy: userId } : {};
    const posts  = await Post.find(filter).sort({ createdAt: -1 });
    return res.json(posts.map(p => toDTO(p, userId)));
  } catch (err) {
    console.error('getPosts:', err.message);
    return res.status(500).json({ message: 'Lỗi khi tải bài viết.' });
  }
};

// @desc  POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Nội dung không được để trống.' });

    let image = '';
    if (req.file)            image = req.file.path || `/uploads/${req.file.filename}`;
    else if (req.body.image) image = req.body.image;

    const u    = req.user;
    const post = await Post.create({
      userId:         u._id,
      authorName:     u.name,
      authorAvatar:   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      authorIsExpert: ['admin', 'manager'].includes(u.role),
      content: content.trim(),
      image
    });
    return res.status(201).json(toDTO(post, u._id));
  } catch (err) {
    console.error('createPost:', err.message);
    return res.status(500).json({ message: 'Lỗi khi đăng bài.' });
  }
};

// @desc  PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    if (!post.userId.equals(req.user._id)) return res.status(403).json({ message: 'Không có quyền chỉnh sửa.' });

    if (req.body.content) post.content = req.body.content.trim();
    if (req.file)          post.image  = req.file.path || `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) post.image = req.body.image;

    await post.save();
    return res.json(toDTO(post, req.user._id));
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật bài.' });
  }
};

// @desc  DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    if (!post.userId.equals(req.user._id) && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền xóa.' });
    }
    await post.deleteOne();
    return res.json({ message: 'Đã xóa bài viết.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi xóa bài.' });
  }
};

// @desc  PUT /api/posts/:id/like
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    const uid = req.user._id;
    const idx = post.likedBy.findIndex(id => id.equals(uid));
    if (idx >= 0) post.likedBy.splice(idx, 1); else post.likedBy.push(uid);
    await post.save();
    return res.json({ likeCount: post.likedBy.length, isLiked: idx < 0 });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật like.' });
  }
};

// @desc  POST /api/posts/:id/comments
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Nội dung bình luận không được để trống.' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    const comment = {
      _id:        new mongoose.Types.ObjectId(),
      userId:     req.user._id,
      authorName: req.user.name,
      content:    content.trim(),
      createdAt:  new Date()
    };
    post.commentList.push(comment);
    await post.save();
    return res.status(201).json({ comment, commentCount: post.commentList.length });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi thêm bình luận.' });
  }
};

// @desc  DELETE /api/posts/:id/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    const comment = post.commentList.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận.' });
    if (!comment.userId.equals(req.user._id) && !post.userId.equals(req.user._id) && !['admin','manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này.' });
    }
    post.commentList.pull({ _id: req.params.commentId });
    await post.save();
    return res.json({ message: 'Đã xóa bình luận.', commentCount: post.commentList.length });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi xóa bình luận.' });
  }
};

// @desc  PUT /api/posts/:id/share — public
export const sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    return res.json({ shares: post.shares });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật share.' });
  }
};

// @desc  PUT /api/posts/:id/save
export const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    const uid = req.user._id;
    const idx = post.savedBy.findIndex(id => id.equals(uid));
    if (idx >= 0) post.savedBy.splice(idx, 1); else post.savedBy.push(uid);
    await post.save();
    return res.json({ isSaved: idx < 0 });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi lưu bài.' });
  }
};
