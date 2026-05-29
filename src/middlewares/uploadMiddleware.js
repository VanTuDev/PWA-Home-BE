import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const fileFilter = (req, file, cb) => {
  if (/jpeg|jpg|png|webp|gif/.test(file.mimetype)) return cb(null, true);
  cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).'));
};

// ─── Cloudinary storage ────────────────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    const url = req.originalUrl || '';
    let folder = 'pawhome/misc';
    if (url.includes('/pets'))      folder = 'pawhome/pets';
    else if (url.includes('/products'))  folder = 'pawhome/products';
    else if (url.includes('/adoptions')) folder = 'pawhome/adoptions';
    else if (url.includes('/posts'))     folder = 'pawhome/community';
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }]
    };
  }
});

// ─── Local disk storage (fallback khi không có Cloudinary) ─────────────────
const localDir = './uploads';
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

// ─── Chọn storage dựa vào env ──────────────────────────────────────────────
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  console.log('[Upload] Storage: Cloudinary ☁️');
} else {
  console.log('[Upload] Storage: Local disk (Cloudinary chưa cấu hình)');
}

const upload = multer({
  storage:   hasCloudinary ? cloudinaryStorage : diskStorage,
  fileFilter,
  limits:    { fileSize: 5 * 1024 * 1024 }
});

export default upload;
