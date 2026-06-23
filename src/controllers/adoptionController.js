import Adoption from '../models/Adoption.js';
import Pet from '../models/Pet.js';
import Donation from '../models/Donation.js';
import { createNotification } from './notificationController.js';

// @desc  GET /api/adoptions/my-tasks
// @access Private (user)
export const getMyTasks = async (req, res) => {
  try {
    const adoptions = await Adoption.find({
      userId: req.user._id,
      status: { $in: ['Approved', 'FollowUp'] }
    }).populate('petId', 'name image breed');

    const DAY_MS = 24 * 60 * 60 * 1000;

    const tasks = adoptions.map(a => {
      const reports   = a.trackingReports || [];
      const doneWeeks = new Set(reports.map(r => r.weekNumber));
      const weeks     = [1, 2, 3, 4].map(w => ({
        weekNumber: w,
        done: doneWeeks.has(w),
        report: reports.find(r => r.weekNumber === w) || null,
      }));

      // Tính tuần hiện tại dựa vào approvedAt (ưu tiên) hoặc updatedAt
      const baseDate  = a.approvedAt || a.updatedAt || a.submittedAt;
      const daysSince = (Date.now() - new Date(baseDate).getTime()) / DAY_MS;
      const expectedWeek = Math.min(4, Math.floor(daysSince / 7) + 1);

      // Tuần đang hoạt động = tuần kỳ vọng chưa hoàn thành, tối thiểu tuần 1
      const currentWeek = Math.min(
        expectedWeek,
        weeks.find(w => !w.done)?.weekNumber ?? 4
      );

      return {
        adoptionId:     a.id,
        pet:            a.petId,
        status:         a.status,
        approvedAt:     baseDate,
        submittedAt:    a.submittedAt,
        weeks,
        currentWeek,
        expectedWeek,
        completedCount: doneWeeks.size,
      };
    });

    return res.status(200).json(tasks);
  } catch (err) {
    console.error('[Tasks] getMyTasks error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @desc    Create a new adoption application
// @route   POST /api/adoptions
// @access  Private
export const createAdoption = async (req, res) => {
  try {
    const { 
      petId, fullName, phone, facebookLink, job, 
      monthlyIncome, address, housingType, experience, reason,
      idCardFront, idCardBack, deliveryOption
    } = req.body;

    if (!petId || !fullName || !phone || !address) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc (Pet, Họ tên, SĐT, Địa chỉ).' });
    }

    // Check if pet exists
    let pet;
    try {
      pet = await Pet.findById(petId);
    } catch {
      return res.status(400).json({ message: 'petId không hợp lệ.' });
    }
    if (!pet) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thú cưng ứng tuyển.' });
    }

    if (pet.status === 'Adopted') {
      return res.status(400).json({ message: 'Bé thú cưng này đã được nhận nuôi thành công bởi một chủ nhân khác.' });
    }

    // Kiểm tra donation bắt buộc: cho phép đã paid hoặc đang chờ xác nhận tiền mặt
    if (pet.donationAmount > 0) {
      const donation = await Donation.findOne({
        petId, userId: req.user._id, type: 'adoption',
        $or: [{ status: 'paid' }, { status: 'pending', paymentMethod: 'cash' }],
      });
      if (!donation) {
        return res.status(403).json({
          code: 'DONATION_REQUIRED',
          message: `Bạn cần hoàn thành khoản đóng góp ${pet.donationAmount.toLocaleString('vi-VN')}đ trước khi đăng ký nhận nuôi bé ${pet.name}.`
        });
      }
    }

    const adoption = new Adoption({
      petId,
      userId: req.user._id,
      fullName,
      phone,
      facebookLink: facebookLink || '',
      job: job || 'Đi làm',
      monthlyIncome: monthlyIncome || '5 - 10 triệu',
      address,
      housingType: housingType || 'Nhà phố',
      experience: experience || 'Chưa từng nuôi',
      reason: reason || '',
      idCardFront: idCardFront || '',
      idCardBack: idCardBack || '',
      deliveryOption: deliveryOption || 'pickup'
    });

    const savedAdoption = await adoption.save();

    // Optionally update pet status to 'Treatment' or keep it as 'Ready' with application pending.
    // Let's keep it 'Ready' but we could update if required.

    return res.status(201).json({
      message: 'Đơn đăng ký nhận nuôi của bạn đã được gửi thành công. Admin sẽ sớm liên hệ!',
      adoption: savedAdoption
    });
  } catch (error) {
    console.error('Create adoption error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi đơn nhận nuôi.' });
  }
};

// @desc    Get adoption applications
// @route   GET /api/adoptions
// @access  Private
export const getAdoptions = async (req, res) => {
  try {
    let adoptions;

    // Admin, manager, staff see everything
    if (['admin', 'manager', 'staff'].includes(req.user.role)) {
      adoptions = await Adoption.find()
        .populate('petId')
        .populate('userId', 'name email phone avatar')
        .sort({ submittedAt: -1 });
    } else {
      // Regular user sees only their own applications
      adoptions = await Adoption.find({ userId: req.user._id })
        .populate('petId')
        .sort({ submittedAt: -1 });
    }

    return res.status(200).json(adoptions);
  } catch (error) {
    console.error('Get adoptions error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách đơn nhận nuôi.' });
  }
};

// @desc    Update adoption application status (Admin)
// @route   PUT /api/adoptions/:id/status
// @access  Private/Admin
export const updateAdoptionStatus = async (req, res) => {
  try {
    const { status } = req.body; // Approved, Rejected, FollowUp, Pending
    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái cập nhật.' });
    }

    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Không tìm thấy đơn nhận nuôi.' });
    }

    adoption.status = status;

    // Ghi lại thời điểm phê duyệt để tính tuần nhiệm vụ chính xác
    if (status === 'Approved' && !adoption.approvedAt) {
      adoption.approvedAt = new Date();
    }

    await adoption.save();

    // Update pet status
    if (status === 'Approved') {
      await Pet.findByIdAndUpdate(adoption.petId, { status: 'Adopted' });
    } else {
      const currentPet = await Pet.findById(adoption.petId);
      if (currentPet && currentPet.status === 'Adopted' && status !== 'Approved') {
        currentPet.status = 'Ready';
        await currentPet.save();
      }
    }

    // Send notification to user
    const petInfo = await Pet.findById(adoption.petId).select('name');
    const petName = petInfo?.name || 'thú cưng';
    const notifMap = {
      Approved: {
        title: '🎉 Đơn nhận nuôi được chấp nhận!',
        body: `Chúc mừng! Đơn nhận nuôi bé ${petName} đã được phê duyệt. Nhiệm vụ 4 tuần chụp ảnh cập nhật đã bắt đầu — hãy vào mục Nhiệm vụ để hoàn thành nhé!`,
      },
      Rejected: { title: '❌ Đơn nhận nuôi bị từ chối',    body: `Rất tiếc, đơn nhận nuôi bé ${petName} chưa được chấp thuận lần này.` },
      FollowUp: { title: '🔍 Đơn nhận nuôi cần xem xét thêm', body: `Đơn nhận nuôi bé ${petName} đang được xem xét thêm.` },
      Pending:  { title: '⏳ Đơn nhận nuôi đang chờ duyệt',   body: `Đơn nhận nuôi bé ${petName} đang được xử lý.` },
    };
    const notif = notifMap[status];
    if (notif) {
      await createNotification({
        userId: adoption.userId,
        type: 'adoption',
        title: notif.title,
        body: notif.body,
        link: '/history',
      });
    }

    return res.status(200).json({ message: 'Cập nhật trạng thái đơn thành công.', adoption });
  } catch (error) {
    console.error('Update adoption status error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi duyệt đơn nhận nuôi.' });
  }
};

// @desc    Add weekly tracking report with photo (upload ảnh trực tiếp, không cần đăng cộng đồng)
// @route   POST /api/adoptions/:id/tracking
// @access  Private
export const addTrackingReport = async (req, res) => {
  try {
    const adoptionId = req.params.id;
    const { comment } = req.body;

    const adoption = await Adoption.findById(adoptionId);
    if (!adoption) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng nhận nuôi phù hợp.' });
    }

    // Chỉ chủ nhân hoặc staff được nộp báo cáo
    if (adoption.userId.toString() !== req.user._id.toString() &&
        !['admin', 'manager', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng tải báo cáo cho hợp đồng này.' });
    }

    // Tự động tính tuần hiện tại từ approvedAt
    const DAY_MS   = 24 * 60 * 60 * 1000;
    const baseDate = adoption.approvedAt || adoption.updatedAt || adoption.submittedAt;
    const daysSince = (Date.now() - new Date(baseDate).getTime()) / DAY_MS;
    const autoWeek  = Math.min(4, Math.floor(daysSince / 7) + 1);

    // weekNumber từ body (nếu có), không thì dùng tự động
    let weekNumber = req.body.weekNumber ? parseInt(req.body.weekNumber) : autoWeek;
    if (weekNumber < 1 || weekNumber > 4) weekNumber = autoWeek;

    // Kiểm tra tuần này đã nộp chưa
    const alreadyDone = adoption.trackingReports.some(r => r.weekNumber === weekNumber);
    if (alreadyDone) {
      return res.status(400).json({ message: `Tuần ${weekNumber} đã được nộp báo cáo rồi.` });
    }

    // Lấy ảnh
    let image = '';
    if (req.file) {
      image = req.file.path?.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh báo cáo tình hình bé.' });
    }

    adoption.trackingReports.push({
      weekNumber,
      image,
      comment: comment || '',
      submittedAt: new Date(),
    });
    await adoption.save();

    // Gửi thông báo hoàn thành nhiệm vụ
    const pet = await Pet.findById(adoption.petId).select('name');
    const completedCount = adoption.trackingReports.length;
    await createNotification({
      userId: adoption.userId,
      type: 'system',
      title: `✅ Hoàn thành nhiệm vụ Tuần ${weekNumber}!`,
      body: completedCount < 4
        ? `Tuyệt vời! Bạn đã nộp ảnh tuần ${weekNumber} cho bé ${pet?.name || 'thú cưng'}. Còn ${4 - completedCount} tuần nữa nhé!`
        : `🎉 Xuất sắc! Bạn đã hoàn thành cả 4 tuần theo dõi cho bé ${pet?.name || 'thú cưng'}. Cảm ơn bạn rất nhiều!`,
      link: '/history',
    });

    return res.status(200).json({
      message: `Nộp báo cáo Tuần ${weekNumber} thành công! Cảm ơn bạn đã cập nhật tình hình bé.`,
      adoption,
    });
  } catch (error) {
    console.error('Add tracking report error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đăng tải báo cáo theo dõi.' });
  }
};
