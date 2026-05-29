import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail, sendResetPasswordEmail } from '../services/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_pwa_home_token_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user & send OTP to email
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin.' });
    }

    const existingUser = await User.findOne({ email });

    // Email đã được xác thực hoàn toàn (không còn otp field)
    if (existingUser && !existingUser.otp) {
      return res.status(400).json({ message: 'Tài khoản email này đã được sử dụng.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser && existingUser.otp) {
      // Đã đăng ký nhưng chưa xác thực → cập nhật OTP mới (resend)
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.otp = { code: otpCode, expiresAt: otpExpires };
      await existingUser.save();
    } else {
      // Tài khoản mới
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        otp: { code: otpCode, expiresAt: otpExpires }
      });
      await newUser.save();
    }

    const emailSent = await sendOtpEmail(email, name, otpCode);

    const response = { message: 'Mã xác nhận OTP đã được gửi tới email của bạn.' };

    // Trả về demoOtp khi chưa cấu hình SMTP (phục vụ development)
    if (!emailSent) {
      response.demoOtp = otpCode;
      response.message = 'Mã OTP đã được tạo (Demo mode — chưa cấu hình email).';
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng ký.' });
  }
};

// @desc    Verify OTP & complete registration, auto-login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Thiếu email hoặc mã xác thực OTP.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản đăng ký.' });
    }

    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Mã xác thực OTP không chính xác.' });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ message: 'Mã xác thực OTP đã hết hạn. Vui lòng nhấn "Gửi lại mã".' });
    }

    // Xóa OTP → tài khoản hoạt động
    user.otp = undefined;
    await user.save();

    // Trả về token để FE tự động đăng nhập sau khi xác thực
    return res.status(200).json({
      message: 'Đăng ký thành công! Chào mừng bạn đến với PAW Home.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('OTP Verification error:', error.message);
    return res.status(500).json({ message: 'Lỗi xác nhận OTP trên máy chủ.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản email hoặc mật khẩu không chính xác.' });
    }

    // Tài khoản chưa xác thực OTP
    if (user.otp) {
      return res.status(403).json({ message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhập mã OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tài khoản email hoặc mật khẩu không chính xác.' });
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        job: user.job,
        salary: user.salary,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Lỗi đăng nhập trên máy chủ.' });
  }
};

// @desc    Gửi email đặt lại mật khẩu
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email.' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Không tiết lộ email có tồn tại hay không — bảo mật tốt hơn
    const GENERIC_MSG = 'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.';

    if (!user) return res.status(200).json({ message: GENERIC_MSG });

    // Tạo token ngẫu nhiên 32 bytes
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
    await user.save();

    const emailSent = await sendResetPasswordEmail(email, user.name, token);

    const response = { message: GENERIC_MSG };
    // Demo mode: trả link để dev có thể test ngay
    if (!emailSent) {
      const feUrl = process.env.FE_URL || 'http://localhost:3000';
      response.demoResetUrl = `${feUrl}/reset-password?token=${token}`;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại.' });
  }
};

// @desc    Đặt lại mật khẩu bằng token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng gửi yêu cầu mới.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password             = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại.' });
  }
};

// @desc    Đổi mật khẩu (đã đăng nhập)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' });
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
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại.' });
  }
};
