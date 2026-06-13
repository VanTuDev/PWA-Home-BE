import Notification from '../models/Notification.js';

// Helper: create a notification (used internally by other controllers)
export const createNotification = async ({ userId, type, title, body, link }) => {
  try {
    await Notification.create({ userId, type, title, body, link });
  } catch (e) {
    console.warn('[Notification] create failed (non-fatal):', e.message);
  }
};

// @desc  GET /api/notifications  — lấy thông báo của user hiện tại
// @access Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @desc  PUT /api/notifications/:id/read
// @access Private
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @desc  PUT /api/notifications/read-all
// @access Private
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
