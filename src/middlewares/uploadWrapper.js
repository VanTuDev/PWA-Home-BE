import upload from './uploadMiddleware.js';

// Bắt lỗi multer/cloudinary và trả JSON thay vì HTML 500
export const withUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      console.error('[Upload] multer error:', err.message);
      return res.status(400).json({ message: `Lỗi upload ảnh: ${err.message}` });
    }
    next();
  });
};

export const withUploadFields = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (err) => {
    if (err) {
      console.error('[Upload] multer error:', err.message);
      return res.status(400).json({ message: `Lỗi upload ảnh: ${err.message}` });
    }
    next();
  });
};
