import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'paw_secret_key', { expiresIn: '30d' });

// @route   POST /api/auth/register
// @access  Public  (multipart/form-data — fields: name, email, password, phone + files: cccdFront, cccdBack)
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email, mật khẩu và số điện thoại.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        message: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.',
        code: 'EMAIL_ALREADY_REGISTERED',
      });
    }

    // CCCD images (uploaded via multer → Cloudinary or local)
    const cccdFront = req.files?.cccdFront?.[0]
      ? (req.files.cccdFront[0].path?.startsWith('http')
          ? req.files.cccdFront[0].path
          : `/uploads/${req.files.cccdFront[0].filename}`)
      : '';
    const cccdBack = req.files?.cccdBack?.[0]
      ? (req.files.cccdBack[0].path?.startsWith('http')
          ? req.files.cccdBack[0].path
          : `/uploads/${req.files.cccdBack[0].filename}`)
      : '';

    const salt     = await bcrypt.genSalt(10);
    const hashed   = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone: phone.trim(),
      cccdFront,
      cccdBack,
    });

    console.log(`[Auth] New user registered: ${user.email}`);

    return res.status(201).json({
      message: 'Đăng ký thành công! Chào mừng bạn đến với PAW Home.',
      token: generateToken(user._id),
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        cccdFront: user.cccdFront,
        cccdBack:  user.cccdBack,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[Auth] register error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng ký.' });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        role:       user.role,
        job:        user.job,
        salary:     user.salary,
        address:    user.address,
        bio:        user.bio,
        avatar:     user.avatar,
        coverPhoto: user.coverPhoto,
        cccdFront:  user.cccdFront,
        cccdBack:   user.cccdBack,
        createdAt:  user.createdAt,
      },
    });
  } catch (err) {
    console.error('[Auth] login error:', err.message);
    return res.status(500).json({ message: 'Lỗi đăng nhập trên máy chủ.' });
  }
};

// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('[Auth] getProfile error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, job, salary, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    if (name)    user.name    = name.trim();
    if (phone)   user.phone   = phone.trim();
    if (address !== undefined) user.address = address;
    if (job     !== undefined) user.job     = job;
    if (salary  !== undefined) user.salary  = salary;
    if (bio     !== undefined) user.bio     = bio.slice(0, 300);

    if (req.files?.avatar?.[0]) {
      const f = req.files.avatar[0];
      user.avatar = f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`;
    }
    if (req.files?.coverPhoto?.[0]) {
      const f = req.files.coverPhoto[0];
      user.coverPhoto = f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`;
    }

    const updated = await user.save();
    return res.status(200).json({
      message: 'Cập nhật hồ sơ thành công!',
      user: {
        id:         updated._id,
        name:       updated.name,
        email:      updated.email,
        phone:      updated.phone,
        role:       updated.role,
        address:    updated.address,
        job:        updated.job,
        salary:     updated.salary,
        bio:        updated.bio,
        avatar:     updated.avatar,
        coverPhoto: updated.coverPhoto,
        createdAt:  updated.createdAt,
      },
    });
  } catch (err) {
    console.error('[Auth] updateProfile error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error('[Auth] changePassword error:', err.message);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
