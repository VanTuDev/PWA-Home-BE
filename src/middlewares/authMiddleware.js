import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_pwa_home_token_key_123');

      // Get user from the token, excluding password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Không thể xác thực người dùng này.' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Phiên đăng nhập hết hạn hoặc không đúng mã xác thực.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Quyền truy cập bị từ chối, không tìm thấy mã token.' });
  }
};

// Middleware to restrict access to specific roles (e.g., admin, manager, staff)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Tài khoản vai trò [${req.user ? req.user.role : 'Guest'}] không có quyền thực hiện hành động này.`
      });
    }
    next();
  };
};
