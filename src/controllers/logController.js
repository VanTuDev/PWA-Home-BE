import AnalyticsEvent from '../models/AnalyticsEvent.js';

const VALID_TYPES = ['landing_view', 'pet_view', 'adopt_click', 'bounce'];

// @desc    Ghi nhận 1 sự kiện phân tích hành vi người dùng (public, kể cả khách vãng lai)
// @route   POST /api/logs
// @access  Public (optionalProtect gắn userId nếu đã đăng nhập)
export const logEvent = async (req, res) => {
  try {
    const { type, visitorId, sessionId, petId } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Loại sự kiện không hợp lệ.' });
    }
    if (!visitorId || !sessionId) {
      return res.status(400).json({ message: 'Thiếu visitorId hoặc sessionId.' });
    }

    await AnalyticsEvent.create({
      type,
      visitorId,
      sessionId,
      petId: petId || null,
      userId: req.user?._id || null
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[Log] Error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi ghi nhận sự kiện.' });
  }
};
