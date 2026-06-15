import Setting from '../models/Setting.js';

const DEFAULT_BANK_INFO = {
  bankName:        'Vietcombank',
  accountNo:       '1234567890',
  accountName:     'TRUNG TAM CUU HO THU CUNG PAW HOME',
  branch:          'Chi nhánh Đà Nẵng',
  transferContent: 'UNGHOPAW',
};

// @desc  GET /api/settings/bank-info  — public
export const getBankInfo = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'bank_info' });
    return res.json(setting?.value ?? DEFAULT_BANK_INFO);
  } catch (err) {
    console.error('[Setting] getBankInfo error:', err.message);
    return res.json(DEFAULT_BANK_INFO);
  }
};

// @desc  PUT /api/settings/bank-info  — admin / manager
export const updateBankInfo = async (req, res) => {
  try {
    const { bankName, accountNo, accountName, branch, transferContent } = req.body;
    if (!bankName || !accountNo || !accountName)
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên ngân hàng, số tài khoản và tên chủ tài khoản.' });

    const value = {
      bankName:        bankName.trim(),
      accountNo:       accountNo.trim(),
      accountName:     accountName.trim().toUpperCase(),
      branch:          (branch || '').trim(),
      transferContent: (transferContent || 'UNGHOPAW').trim(),
    };

    await Setting.findOneAndUpdate(
      { key: 'bank_info' },
      { $set: { value } },
      { upsert: true, new: true }
    );

    console.log(`[Setting] bank_info updated by ${req.user.email}`);
    return res.json({ message: 'Đã cập nhật thông tin chuyển khoản.', data: value });
  } catch (err) {
    console.error('[Setting] updateBankInfo error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
