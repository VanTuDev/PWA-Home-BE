import Adoption from '../models/Adoption.js';
import Pet from '../models/Pet.js';
import Donation from '../models/Donation.js';

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
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thú cưng ứng tuyển.' });
    }

    if (pet.status === 'Adopted') {
      return res.status(400).json({ message: 'Bé thú cưng này đã được nhận nuôi thành công bởi một chủ nhân khác.' });
    }

    // Kiểm tra donation bắt buộc
    if (pet.donationAmount > 0) {
      const donation = await Donation.findOne({ petId, userId: req.user._id, type: 'adoption', status: 'paid' });
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
        .populate('userId', 'name email phone')
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
    await adoption.save();

    // If approved, update the pet's status to 'Adopted'
    if (status === 'Approved') {
      await Pet.findByIdAndUpdate(adoption.petId, { status: 'Adopted' });
    } else {
      // If changed back from approved, make pet ready again
      const currentPet = await Pet.findById(adoption.petId);
      if (currentPet && currentPet.status === 'Adopted' && status !== 'Approved') {
        currentPet.status = 'Ready';
        await currentPet.save();
      }
    }

    return res.status(200).json({
      message: 'Cập nhật trạng thái đơn thành công.',
      adoption
    });
  } catch (error) {
    console.error('Update adoption status error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi duyệt đơn nhận nuôi.' });
  }
};

// @desc    Add weekly tracking report with photo
// @route   POST /api/adoptions/:id/tracking
// @access  Private
export const addTrackingReport = async (req, res) => {
  try {
    const { weekNumber, comment } = req.body;
    const adoptionId = req.params.id;

    if (!weekNumber) {
      return res.status(400).json({ message: 'Thiếu chỉ số tuần của báo cáo.' });
    }

    const adoption = await Adoption.findById(adoptionId);
    if (!adoption) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng nhận nuôi phù hợp.' });
    }

    // Check if the user is authorized (must be owner or staff)
    if (adoption.userId.toString() !== req.user._id.toString() && !['admin', 'manager', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng tải báo cáo cho hợp đồng này.' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    } else {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh báo cáo tình hình bé.' });
    }

    const newReport = {
      weekNumber: parseInt(weekNumber),
      image,
      comment: comment || '',
      submittedAt: new Date()
    };

    adoption.trackingReports.push(newReport);
    await adoption.save();

    return res.status(200).json({
      message: 'Đăng tải báo cáo tuần thành công. Cảm ơn bạn đã cập nhật tình hình bé!',
      adoption
    });
  } catch (error) {
    console.error('Add tracking report error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đăng tải báo cáo theo dõi.' });
  }
};
