// Phải là import đầu tiên trong index.js — các module khác (vd config/cloudinary.js,
// middlewares/uploadMiddleware.js) đọc process.env ở top-level ngay lúc import, nên
// dotenv.config() cần chạy trước khi bất kỳ import nào khác được tải, nếu không các
// biến CLOUDINARY_* sẽ luôn undefined khi chạy local (chỉ .env, không như Render tự bơm env).
import dotenv from 'dotenv';
dotenv.config();
