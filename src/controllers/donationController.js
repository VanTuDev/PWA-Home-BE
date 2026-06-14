import Donation from '../models/Donation.js';
import Pet from '../models/Pet.js';
import { createPaymentLink, verifyWebhook, isConfigured } from '../services/payosService.js';

const isDev   = process.env.NODE_ENV !== 'production';
const FE_BASE = isDev ? `http://localhost:${process.env.FE_PORT || 3000}` : (process.env.FE_URL || 'http://localhost:3000');
const BE_BASE = isDev ? `http://localhost:${process.env.PORT || 5000}`    : (process.env.BE_URL || 'https://pwa-home-be.onrender.com');

// @desc  POST /api/donations  — general donation (ghi nhận ngay)
export const createDonation = async (req, res) => {
  try {
    const { petId, amount, donorName, message } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Vui lòng cung cấp số tiền quyên góp hợp lệ.' });

    const userId    = req.user?._id || null;
    const finalName = donorName || req.user?.name || 'Mạnh thường quân ẩn danh';

    if (petId) {
      const pet = await Pet.findById(petId);
      if (!pet) return res.status(404).json({ message: 'Không tìm thấy bé thú cưng.' });
    }

    const donation = await Donation.create({
      petId: petId || null, userId, donorName: finalName,
      amount: parseFloat(amount), message: message || '',
      type: 'general', status: 'paid',
    });

    return res.status(201).json({ message: 'Cảm ơn tấm lòng của bạn!', donation });
  } catch (err) {
    console.error('createDonation error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xử lý quyên góp.' });
  }
};

// @desc  POST /api/donations/adoption  — donation bắt buộc trước khi nhận nuôi (qua PayOS)
export const createAdoptionDonation = async (req, res) => {
  try {
    const { petId } = req.body;
    if (!petId) return res.status(400).json({ message: 'Thiếu petId.' });

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Không tìm thấy bé thú cưng.' });
    if (pet.donationAmount <= 0) return res.status(400).json({ message: 'Bé này không yêu cầu đóng góp.' });
    if (pet.status === 'Adopted') return res.status(400).json({ message: 'Bé này đã được nhận nuôi.' });

    const userId = req.user._id;

    // Đã donate thành công trước đó → báo ngay
    const existing = await Donation.findOne({ petId, userId, type: 'adoption', status: 'paid' });
    if (existing) return res.status(200).json({ alreadyDonated: true });

    const orderCode = Date.now();
    await Donation.create({
      petId, userId,
      donorName:  req.user.name,
      donorEmail: req.user.email || '',
      amount:     pet.donationAmount,
      type:       'adoption',
      status:     'pending',
      payosOrderCode: orderCode,
    });

    if (!isConfigured()) {
      // Dev: tự mark paid
      await Donation.findOneAndUpdate({ payosOrderCode: orderCode }, { status: 'paid' });
      return res.status(201).json({ alreadyDonated: true });
    }

    const payosData = await createPaymentLink({
      orderCode,
      amount:      pet.donationAmount,
      description: `Donate ${pet.name}`.slice(0, 25),
      items: [{ name: `Đóng góp nhận nuôi ${pet.name}`.slice(0, 50), quantity: 1, price: pet.donationAmount }],
      returnUrl:  `${BE_BASE}/api/donations/payos_return`,
      cancelUrl:  `${FE_BASE}/payment/result?type=donation&status=cancelled&petId=${petId}`,
    });

    console.log(`[Donation] PayOS link created — orderCode: ${orderCode}, pet: ${pet.name}, amount: ${pet.donationAmount}`);
    return res.status(201).json({ checkoutUrl: payosData.checkoutUrl });
  } catch (err) {
    console.error('[Donation] createAdoptionDonation error:', err.message, err.stack);
    return res.status(500).json({ message: 'Lỗi khi tạo liên kết thanh toán.' });
  }
};

// @desc  GET /api/donations/check?petId=xxx
export const checkAdoptionDonation = async (req, res) => {
  try {
    const { petId } = req.query;
    const donation  = await Donation.findOne({ petId, userId: req.user._id, type: 'adoption', status: 'paid' });
    return res.status(200).json({ donated: !!donation });
  } catch (err) {
    console.error('[Donation] checkAdoptionDonation error:', err.message);
    return res.status(500).json({ message: 'Lỗi kiểm tra.' });
  }
};

// @desc  POST /api/donations/payos_webhook
export const payosDonationWebhook = async (req, res) => {
  try {
    console.log('[Donation] Webhook received:', JSON.stringify(req.body).slice(0, 200));
    const webhookData = await verifyWebhook(req.body);
    const { orderCode, code } = webhookData;
    const donation = await Donation.findOne({ payosOrderCode: orderCode });
    if (donation && donation.status !== 'paid') {
      donation.status = code === '00' ? 'paid' : 'failed';
      donation.payosTransactionId = webhookData.reference || '';
      await donation.save();
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('donation webhook error:', err.message);
    return res.status(200).json({ success: true });
  }
};

// @desc  GET /api/donations/payos_return
export const payosDonationReturn = async (req, res) => {
  try {
    const { code, status, orderCode, cancel } = req.query;
    console.log(`[Donation] PayOS return — code:${code} status:${status} orderCode:${orderCode} cancel:${cancel}`);
    const isPaid      = code === '00' && status === 'PAID';
    const isCancelled = cancel === 'true' || status === 'CANCELLED';

    let petId = '';
    let donationId = '';
    if (orderCode) {
      const donation = await Donation.findOne({ payosOrderCode: Number(orderCode) });
      if (donation) {
        if (donation.status !== 'paid') {
          donation.status = isPaid ? 'paid' : 'failed';
          await donation.save();
        }
        petId      = donation.petId?.toString() || '';
        donationId = donation._id?.toString()   || '';
      }
    }

    const s = isPaid ? 'success' : isCancelled ? 'cancelled' : 'failed';
    return res.redirect(`${FE_BASE}/payment/result?type=donation&status=${s}&petId=${petId}&donationId=${donationId}`);
  } catch (err) {
    console.error('[Donation] payosDonationReturn error:', err.message);
    return res.redirect(`${FE_BASE}/payment/result?type=donation&status=error`);
  }
};

// @desc  GET /api/donations
export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('petId', 'name image breed status')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });
    return res.status(200).json(donations);
  } catch (err) {
    console.error('[Donation] getDonations error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @desc  GET /api/donations/my  — lịch sử thanh toán của user hiện tại
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .populate('petId', 'name image breed status donationAmount')
      .sort({ createdAt: -1 });
    return res.status(200).json(donations);
  } catch (err) {
    console.error('[Donation] getMyDonations error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @desc  POST /api/donations/system  — ủng hộ PAW Home (có/không đăng nhập)
export const createSystemDonation = async (req, res) => {
  try {
    const { amount, message, donorName } = req.body;
    if (!amount || Number(amount) < 5000)
      return res.status(400).json({ message: 'Số tiền ủng hộ tối thiểu là 5.000đ.' });

    const userId    = req.user?._id || null;
    const finalName = donorName || req.user?.name || 'Mạnh thường quân ẩn danh';
    const donorEmail = req.user?.email || '';
    const orderCode  = Date.now();

    const donation = await Donation.create({
      petId: null, userId,
      donorName:  finalName,
      donorEmail,
      amount:     parseFloat(amount),
      message:    message || '',
      type:       'general',
      status:     'pending',
      payosOrderCode: orderCode,
    });

    if (!isConfigured()) {
      // Dev: mark paid ngay
      donation.status = 'paid';
      await donation.save();
      return res.status(201).json({ success: true, donationId: donation._id });
    }

    const payosData = await createPaymentLink({
      orderCode,
      amount:     parseFloat(amount),
      description: 'Ủng hộ PAW Home',
      items: [{ name: 'Ủng hộ PAW Home', quantity: 1, price: parseFloat(amount) }],
      returnUrl:  `${BE_BASE}/api/donations/payos_return`,
      cancelUrl:  `${FE_BASE}/donate?status=cancelled`,
    });

    console.log(`[Donation] System donation PayOS link — orderCode: ${orderCode}, amount: ${amount}`);
    return res.status(201).json({ checkoutUrl: payosData.checkoutUrl, donationId: donation._id });
  } catch (err) {
    console.error('[Donation] createSystemDonation error:', err.message, err.stack);
    return res.status(500).json({ message: 'Lỗi khi tạo liên kết thanh toán.' });
  }
};

// @desc  PATCH /api/donations/:id/bill  — cập nhật ảnh bill
export const uploadBillImage = async (req, res) => {
  try {
    const { billImage } = req.body;
    if (!billImage)
      return res.status(400).json({ message: 'Thiếu billImage.' });

    const donation = await Donation.findById(req.params.id);
    if (!donation)
      return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });

    donation.billImage = billImage;
    await donation.save();
    return res.status(200).json(donation);
  } catch (err) {
    console.error('[Donation] uploadBillImage error:', err.message);
    return res.status(500).json({ message: 'Lỗi cập nhật ảnh bill.' });
  }
};
