/**
 * seed.js — chỉ dùng khi cần reset database thủ công.
 * Không được gọi tự động khi server khởi động nữa.
 * Chạy: npm run seed
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pwa_home';
    await mongoose.connect(connStr);
    console.log('[Seed] Connected.');

    await User.deleteMany({});

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Vantu16022003@', salt);
    await User.create({
      name:  'Vân Tú - Admin',
      email: (process.env.ADMIN_EMAIL || 'Vantu.dev@gmail.com').toLowerCase(),
      password: hashed,
      phone: '0988888888',
      role: 'admin'
    });

    console.log('[Seed] Done.');
    mongoose.connection.close();
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

// Chỉ chạy khi gọi trực tiếp: node src/config/seed.js
if (process.argv[1]?.includes('seed.js')) {
  seedDB();
}

export default seedDB;
