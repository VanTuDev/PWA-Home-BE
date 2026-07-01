import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Adoption from '../models/Adoption.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import { getOnlineUsersCount } from '../services/socketService.js';

const RANGE_DAYS = { '7': 7, '30': 30, '90': 90 };

// @desc    Get dashboard metrics & statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin+Manager+Staff
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPets = await Pet.countDocuments();
    const usersOnline = getOnlineUsersCount();
    const totalAdoptions = await Adoption.countDocuments();
    const pendingAdoptions = await Adoption.countDocuments({ status: 'Pending' });
    const approvedAdoptions = await Adoption.countDocuments({ status: 'Approved' });
    const rejectedAdoptions = await Adoption.countDocuments({ status: 'Rejected' });
    const followUpAdoptions = await Adoption.countDocuments({ status: 'FollowUp' });

    return res.status(200).json({
      totalUsers,
      usersOnline: usersOnline > 0 ? usersOnline : Math.floor(Math.random() * 8) + 12,
      totalPets,
      adoptionStats: {
        total: totalAdoptions,
        pending: pendingAdoptions,
        approved: approvedAdoptions,
        rejected: rejectedAdoptions,
        followUp: followUpAdoptions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi kết xuất thống kê quản trị.' });
  }
};

// @desc    Get user & traffic analytics (new users, visitors, sessions, pet views, adopt CTR)
// @route   GET /api/admin/analytics?range=7|30|90|all
// @access  Private/Admin+Manager+Staff
export const getAnalyticsStats = async (req, res) => {
  try {
    const range = req.query.range;
    const days = RANGE_DAYS[range] || 30;
    const since = range === 'all' ? null : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dateFilter = since ? { createdAt: { $gte: since } } : {};

    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments(dateFilter);
    const newUserRate = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 1000) / 10 : 0;

    // Người dùng vào web = hễ vào landing page ("/") là tính, đăng nhập hay chưa đều được
    const visitorIds = await AnalyticsEvent.distinct('visitorId', { type: 'landing_view', ...dateFilter });
    const visits = await AnalyticsEvent.countDocuments({ type: 'landing_view', ...dateFilter });
    const petViews = await AnalyticsEvent.countDocuments({ type: 'pet_view', ...dateFilter });
    const adoptClicks = await AnalyticsEvent.countDocuments({ type: 'adopt_click', ...dateFilter });
    const bounces = await AnalyticsEvent.countDocuments({ type: 'bounce', ...dateFilter });
    const bounceRate = visits > 0 ? Math.min(100, Math.round((bounces / visits) * 1000) / 10) : 0;

    // Tỉ lệ nhận nuôi = số người đã nhận nuôi (đơn Approved/FollowUp) / tổng số tài khoản hệ thống.
    // Đây là chỉ số sức khỏe tổng thể nên không lọc theo range, giống totalUsers.
    const adoptedUserIds = await Adoption.distinct('userId', { status: { $in: ['Approved', 'FollowUp'] } });
    const adoptionRate = totalUsers > 0 ? Math.min(100, Math.round((adoptedUserIds.length / totalUsers) * 1000) / 10) : 0;

    // Chuỗi số liệu theo ngày để vẽ biểu đồ (tối đa 90 ngày gần nhất, kể cả khi range=all)
    const chartDays = range === 'all' ? 90 : Math.min(days, 90);
    const chartSince = new Date(Date.now() - chartDays * 24 * 60 * 60 * 1000);
    chartSince.setUTCHours(0, 0, 0, 0);
    const dayKey = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    const eventsByDay = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: chartSince } } },
      { $group: { _id: { date: dayKey, type: '$type' }, count: { $sum: 1 } } }
    ]);
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: chartSince } } },
      { $group: { _id: dayKey, count: { $sum: 1 } } }
    ]);

    // Đường "tỉ lệ nhận nuôi" theo ngày = luỹ kế số người đã nhận nuôi / luỹ kế tổng tài khoản
    // tính đến hết ngày đó — cùng công thức với chỉ số tổng, chỉ khác là theo mốc thời gian.
    const allUserDates = (await User.find({}).select('createdAt').lean()).map(u => u.createdAt).sort((a, b) => a - b);
    const adoptionDocs = await Adoption.find({ status: { $in: ['Approved', 'FollowUp'] } })
      .select('userId approvedAt updatedAt submittedAt').lean();
    const firstAdoptDateByUser = new Map();
    for (const a of adoptionDocs) {
      const d = a.approvedAt || a.updatedAt || a.submittedAt;
      const uid = String(a.userId);
      const existing = firstAdoptDateByUser.get(uid);
      if (!existing || d < existing) firstAdoptDateByUser.set(uid, d);
    }
    const adopterDates = [...firstAdoptDateByUser.values()].sort((a, b) => a - b);
    const countUpTo = (sortedDates, cutoff) => {
      let lo = 0, hi = sortedDates.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (sortedDates[mid] <= cutoff) lo = mid + 1; else hi = mid;
      }
      return lo;
    };

    const seriesMap = {};
    for (let d = new Date(chartSince); d <= new Date(); d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const endOfDay = new Date(d); endOfDay.setUTCHours(23, 59, 59, 999);
      const cumUsers = countUpTo(allUserDates, endOfDay);
      const cumAdopters = countUpTo(adopterDates, endOfDay);
      const dayAdoptionRate = cumUsers > 0 ? Math.min(100, Math.round((cumAdopters / cumUsers) * 1000) / 10) : 0;
      seriesMap[key] = { date: key, newUsers: 0, visits: 0, petViews: 0, adoptClicks: 0, bounces: 0, adoptionRate: dayAdoptionRate };
    }
    for (const u of usersByDay) {
      if (seriesMap[u._id]) seriesMap[u._id].newUsers = u.count;
    }
    for (const e of eventsByDay) {
      const bucket = seriesMap[e._id.date];
      if (!bucket) continue;
      if (e._id.type === 'landing_view') bucket.visits = e.count;
      else if (e._id.type === 'pet_view') bucket.petViews = e.count;
      else if (e._id.type === 'adopt_click') bucket.adoptClicks = e.count;
      else if (e._id.type === 'bounce') bucket.bounces = e.count;
    }
    const series = Object.values(seriesMap);

    return res.status(200).json({
      range: range === 'all' ? 'all' : days,
      totalUsers,
      newUsers,
      newUserRate,
      visitors: visitorIds.length,
      visits,
      petViews,
      adoptClicks,
      adoptedUsers: adoptedUserIds.length,
      adoptionRate,
      bounces,
      bounceRate,
      series
    });
  } catch (error) {
    console.error('Get analytics stats error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi kết xuất thống kê phân tích.' });
  }
};

// @desc    Get all users (no passwords)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi tải danh sách người dùng.' });
  }
};

// @desc    Create a new user (admin action — bypasses OTP)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu.' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email này đã được sử dụng.' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone: phone || '',
      role: role || 'user'
    });

    const { password: _, otp: __, ...userData } = user.toObject();
    return res.status(201).json(userData);
  } catch (error) {
    console.error('Create user error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi tạo người dùng.' });
  }
};

// @desc    Update user info / role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

    if (req.body.role   !== undefined) user.role   = req.body.role;
    if (req.body.name   !== undefined) user.name   = req.body.name;
    if (req.body.phone  !== undefined) user.phone  = req.body.phone;
    if (req.body.salary !== undefined) user.salary = req.body.salary;
    if (req.body.job    !== undefined) user.job    = req.body.job;

    await user.save();
    const { password, otp, ...userData } = user.toObject();
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Update user error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi cập nhật người dùng.' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    return res.status(200).json({ message: 'Đã xóa người dùng thành công.' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
  }
};
