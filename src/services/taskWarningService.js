import cron from 'node-cron';
import Adoption from '../models/Adoption.js';
import { createNotification } from '../controllers/notificationController.js';
import { DAY_MS, getExpectedWeek, getDaysIntoCurrentWeek } from '../utils/missionWeek.js';

/**
 * Kiểm tra tất cả adoption Approved/FollowUp và gửi cảnh báo cho
 * những user chưa nộp báo cáo đúng hạn (quá 3 ngày so với deadline tuần,
 * tức từ Thứ 5 của tuần nhiệm vụ hiện tại trở đi).
 */
export const checkAndWarnOverdueTasks = async () => {
  try {
    const adoptions = await Adoption.find({
      status: { $in: ['Approved', 'FollowUp'] },
    }).populate('userId', 'name');

    let warned = 0;
    for (const adoption of adoptions) {
      if (!adoption.userId) continue;

      const approvedAt = adoption.approvedAt || adoption.updatedAt || adoption.submittedAt;
      const expectedWeek = getExpectedWeek(approvedAt);

      const doneWeeks = new Set((adoption.trackingReports || []).map(r => r.weekNumber));
      const completedCount = doneWeeks.size;

      // Quá hạn nếu completedCount < expectedWeek và đã qua deadline tuần hiện tại >= 3 ngày
      const daysIntoCurrentWeek = getDaysIntoCurrentWeek(approvedAt, expectedWeek);
      const isOverdue = completedCount < expectedWeek && daysIntoCurrentWeek >= 3;

      if (!isOverdue) continue;

      // Tránh spam: kiểm tra xem đã gửi warning trong 24h chưa
      const recentWarning = await (await import('../models/Notification.js')).default.findOne({
        userId: adoption.userId._id,
        type: 'system',
        title: { $regex: 'nhiệm vụ tuần' },
        createdAt: { $gte: new Date(Date.now() - DAY_MS) },
      });
      if (recentWarning) continue;

      const missingWeeks = [1, 2, 3, 4].filter(w => !doneWeeks.has(w) && w <= expectedWeek);
      await createNotification({
        userId: adoption.userId._id,
        type: 'system',
        title: `⚠️ Nhắc nhở nhiệm vụ tuần ${missingWeeks.join(', ')}`,
        body: `Bạn chưa cập nhật ảnh theo dõi cho tuần ${missingWeeks.join(', ')}. Hãy đăng bài có ảnh lên Cộng đồng để hoàn thành nhiệm vụ!`,
        link: '#missions',
      });
      warned++;
    }

    if (warned > 0) console.log(`[TaskWarning] Đã gửi cảnh báo cho ${warned} người dùng.`);
  } catch (err) {
    console.error('[TaskWarning] Lỗi:', err.message);
  }
};

/**
 * Lấy danh sách adoption bị quá hạn (dành cho admin).
 */
export const getOverdueAdoptions = async () => {
  const adoptions = await Adoption.find({
    status: { $in: ['Approved', 'FollowUp'] },
  })
    .populate('userId', 'name email avatar')
    .populate('petId', 'name image breed');

  const result = [];
  for (const adoption of adoptions) {
    const approvedAt   = adoption.approvedAt || adoption.updatedAt || adoption.submittedAt;
    const daysSince    = (Date.now() - new Date(approvedAt).getTime()) / DAY_MS;
    const expectedWeek = getExpectedWeek(approvedAt);
    const doneWeeks    = new Set((adoption.trackingReports || []).map(r => r.weekNumber));
    const completedCount = doneWeeks.size;
    const daysIntoCurrentWeek = getDaysIntoCurrentWeek(approvedAt, expectedWeek);
    const isOverdue    = completedCount < expectedWeek && daysIntoCurrentWeek >= 3;

    if (!isOverdue) continue;

    const missingWeeks = [1, 2, 3, 4].filter(w => !doneWeeks.has(w) && w <= expectedWeek);
    result.push({
      adoptionId:    adoption.id,
      user:          adoption.userId,
      pet:           adoption.petId,
      status:        adoption.status,
      daysSince:     Math.floor(daysSince),
      expectedWeek,
      completedCount,
      missingWeeks,
      daysOverdue:   Math.floor(daysIntoCurrentWeek),
    });
  }

  return result.sort((a, b) => b.daysOverdue - a.daysOverdue);
};

/**
 * Khởi động cron: chạy mỗi ngày lúc 9:00 sáng.
 */
export const startTaskWarningCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[TaskWarning] Đang kiểm tra nhiệm vụ quá hạn...');
    await checkAndWarnOverdueTasks();
  });
  console.log('[TaskWarning] Cron job đã khởi động (chạy lúc 9:00 sáng mỗi ngày).');
};
