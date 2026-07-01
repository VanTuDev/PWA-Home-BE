export const DAY_MS = 24 * 60 * 60 * 1000;

// Thứ 2 (00:00) của tuần chứa `date`
export const startOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = CN ... 6 = Thứ 7
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
};

// Thứ 2 (00:00) của tuần nhiệm vụ thứ `weekNumber` (1-4), tính từ tuần lịch chứa approvedAt
export const getWeekStart = (approvedAt, weekNumber) =>
  new Date(startOfWeek(approvedAt).getTime() + (weekNumber - 1) * 7 * DAY_MS);

// Tuần nhiệm vụ hiện tại (1-4) — tuần 1 = tuần lịch (Thứ 2 → Chủ nhật) chứa ngày duyệt đơn,
// nên nhiệm vụ luôn chuyển sang tuần mới đúng vào Thứ 2, bất kể đơn được duyệt ngày nào trong tuần.
export const getExpectedWeek = (approvedAt) => {
  const weeksPassed = Math.floor((startOfWeek(Date.now()) - startOfWeek(approvedAt)) / (7 * DAY_MS));
  return Math.min(4, Math.max(1, weeksPassed + 1));
};

// Số ngày (có phần thập phân) đã trôi qua kể từ Thứ 2 của tuần nhiệm vụ hiện tại — dùng để
// xác định quá hạn (cảnh báo khi >= 3, tức từ Thứ 5 trở đi).
export const getDaysIntoCurrentWeek = (approvedAt, expectedWeek) =>
  (Date.now() - getWeekStart(approvedAt, expectedWeek).getTime()) / DAY_MS;
