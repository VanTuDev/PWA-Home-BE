import Post from '../models/Post.js';

// Helper to format relative time in Vietnamese
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  return `${diffDays} ngày trước`;
};

// @desc    Create a new community post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp nội dung chia sẻ.' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const post = new Post({
      userId: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar || `https://i.pravatar.cc/150?u=${req.user._id}`,
      authorIsExpert: req.user.role === 'admin' || req.user.role === 'manager',
      content,
      image,
      likes: Math.floor(Math.random() * 5),
      comments: 0
    });

    const savedPost = await post.save();
    
    // Add custom virtual/dynamic 'time' output
    const postJson = savedPost.toJSON();
    postJson.time = formatRelativeTime(savedPost.createdAt);

    return res.status(201).json(postJson);
  } catch (error) {
    console.error('Create post error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đăng tin chia sẻ.' });
  }
};

// @desc    Get all community posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    
    // Map with computed relative time strings
    const formattedPosts = posts.map(post => {
      const postJson = post.toJSON();
      postJson.time = formatRelativeTime(post.createdAt);
      return postJson;
    });

    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải bảng tin cộng đồng.' });
  }
};

// @desc    Like a community post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng.' });
    }

    post.likes += 1;
    await post.save();

    return res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error('Like post error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi thích bài viết.' });
  }
};
