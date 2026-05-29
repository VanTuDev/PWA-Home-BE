import Donation from '../models/Donation.js';
import Pet from '../models/Pet.js';

// @desc    Create a new donation entry
// @route   POST /api/donations
// @access  Public (or Private if logged in)
export const createDonation = async (req, res) => {
  try {
    const { petId, amount, donorName, message } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số tiền quyên góp hợp lệ.' });
    }

    // Set user ID if logged in, otherwise null
    const userId = req.user ? req.user._id : null;
    let finalDonorName = donorName || 'Mạnh thường quân ẩn danh';
    
    if (req.user && !donorName) {
      finalDonorName = req.user.name;
    }

    // If petId is provided, check if pet exists
    if (petId) {
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Không tìm thấy bé thú cưng tương ứng.' });
      }
    }

    const donation = new Donation({
      petId: petId || null,
      userId,
      donorName: finalDonorName,
      amount: parseFloat(amount),
      message: message || ''
    });

    const savedDonation = await donation.save();
    return res.status(201).json({
      message: 'Cảm ơn tấm lòng vàng của bạn đã ủng hộ trạm cứu hộ!',
      donation: savedDonation
    });
  } catch (error) {
    console.error('Create donation error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xử lý quyên góp.' });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public
export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('petId', 'name image breed status')
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    console.error('Get donations error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách quyên góp.' });
  }
};
