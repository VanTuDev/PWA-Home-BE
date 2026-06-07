import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

// @desc  GET /api/chat/:userId  — load lịch sử chat
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const isStaff = ['admin', 'manager', 'staff'].includes(req.user.role);

    // User chỉ được đọc phòng của mình
    if (!isStaff && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Không có quyền.' });
    }

    const messages = await ChatMessage.find({ roomId: userId })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json(messages);
  } catch (err) {
    console.error('[Chat] getMessages error:', err.message);
    return res.status(500).json({ message: 'Lỗi tải tin nhắn.' });
  }
};

// @desc  PUT /api/chat/:userId/read  — đánh dấu đã đọc (admin gọi)
export const markRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await ChatMessage.updateMany(
      { roomId: userId, isFromAdmin: false, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Chat] markRead error:', err.message);
    return res.status(500).json({ message: 'Lỗi.' });
  }
};

// @desc  GET /api/chat/rooms  — admin lấy danh sách phòng chat có tin nhắn
export const getRooms = async (req, res) => {
  try {
    // Aggregate: lấy roomId duy nhất + tin nhắn cuối + số unread
    const rooms = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage:  { $first: '$content' },
          lastAt:       { $first: '$createdAt' },
          lastFromAdmin:{ $first: '$isFromAdmin' },
          unread: {
            $sum: { $cond: [{ $and: [{ $eq: ['$isFromAdmin', false] }, { $eq: ['$isRead', false] }] }, 1, 0] }
          }
        }
      },
      { $sort: { lastAt: -1 } }
    ]);

    // Lấy thông tin user cho mỗi phòng
    const userIds = rooms.map(r => r._id);
    const users   = await User.find({ _id: { $in: userIds } }).select('name email avatar').lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const result = rooms.map(r => ({
      userId:   r._id,
      user:     userMap[r._id] || { name: 'Người dùng ẩn danh' },
      lastMessage:   r.lastMessage,
      lastAt:        r.lastAt,
      lastFromAdmin: r.lastFromAdmin,
      unread:        r.unread,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('getRooms error:', err.message);
    return res.status(500).json({ message: 'Lỗi tải phòng chat.' });
  }
};
