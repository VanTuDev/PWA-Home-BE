import './loadEnv.js';

import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import connectDB from './config/db.js';
import { initializeSocket } from './services/socketService.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/authRoutes.js';
import petRoutes from './routes/petRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adoptionRoutes from './routes/adoptionRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import logRoutes from './routes/logRoutes.js';
import { startTaskWarningCron } from './services/taskWarningService.js';

// ─── CORS ────────────────────────────────────────────────────────────────────
// FE_ORIGIN hỗ trợ nhiều domain cách nhau bằng dấu phẩy
// VD: FE_ORIGIN=https://pwa-home.vercel.app,https://custom-domain.com
const extraOrigins = process.env.FE_ORIGIN
  ? process.env.FE_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [
  // ── Local development ──
  'http://localhost:3000',   // Vite custom port (vite --port 3000)
  'http://localhost:5173',   // Vite default port
  'http://localhost:5174',   // Vite fallback port
  'http://localhost:4173',   // Vite preview
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',

  // ── Production Vercel ──
  'https://pwa-home.vercel.app',
  'https://pwa-home-8z3e43kv4-vantudevs-projects.vercel.app',

  // ── Render BE (health checks, self-call) ──
  'https://pwa-home-be.onrender.com',

  // ── Extra origins từ env ──
  ...extraOrigins
];

const corsOptions = {
  origin: (origin, callback) => {
    // Không có origin → Postman / server-to-server / Render health check
    if (!origin) return callback(null, true);

    // Khớp danh sách cứng
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Cho phép mọi *.vercel.app (Vercel preview deployments)
    if (/^https:\/\/[^.]+\.vercel\.app$/.test(origin)) return callback(null, true);

    // Cho phép mọi *.onrender.com (Render services gọi nhau)
    if (/^https:\/\/[^.]+\.onrender\.com$/.test(origin)) return callback(null, true);

    console.warn(`[CORS] Blocked: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // cache preflight 24h — giảm số lượng OPTIONS request
};

// ─── Startup ─────────────────────────────────────────────────────────────────
const startServer = async () => {
  // Tạo thư mục uploads nếu chưa có (Render ephemeral disk)
  const uploadsDir = path.join(path.resolve(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[Init] Created uploads directory');
  }

  await connectDB();

  // Seed đã được chạy — không auto-seed nữa để tránh ghi đè data production

  // Đảm bảo tài khoản admin luôn tồn tại và có thể login
  try {
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'Vantu.dev@gmail.com').toLowerCase();
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Vantu16022003@';
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(ADMIN_PASS, salt);
      await User.create({
        name: ' Admin', email: ADMIN_EMAIL,
        password: hashed, phone: '0988888888', role: 'admin'
      });
      console.log(`[Init] Created admin: ${ADMIN_EMAIL}`);
    } else {
      let changed = false;
      // Xoá OTP pending nếu có — admin không cần xác thực email
      if (existing.otp?.code) {
        existing.otp = undefined;
        changed = true;
        console.log(`[Init] Cleared pending OTP for admin: ${ADMIN_EMAIL}`);
      }
      // Đảm bảo role là admin
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        changed = true;
      }
      if (changed) await existing.save();
    }
  } catch (err) {
    console.error('[Init] Cannot ensure admin:', err.message);
  }

  const app = express();
  const server = http.createServer(app);

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // handle preflight

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files — serve uploads
  app.use('/uploads', express.static(uploadsDir));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/pets', petRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/adoptions', adoptionRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/posts', communityRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/logs', logRoutes);

  // Start cron jobs
  startTaskWarningCron();

  // Health check — cron-job.org ping mỗi 10 phút để Render không ngủ
  const healthHandler = (req, res) => res.json({ status: 'ok', ts: Date.now() });
  app.get('/', healthHandler);
  app.get('/api/health', healthHandler);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  initializeSocket(server);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==========================================`);
    console.log(`  PAW Home API  →  http://0.0.0.0:${PORT}`);
    console.log(`  ENV        : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  MongoDB    : ${process.env.MONGO_URI ? '✓ configured' : '✗ MISSING'}`);
    console.log(`  SMTP       : ${process.env.SMTP_USER ? `✓ ${process.env.SMTP_USER}` : '✗ not set (demo mode)'}`);
    console.log(`  PayOS      : ${process.env.PAYOS_CLIENT_ID ? '✓ configured' : '✗ not set (dev mode)'}`);
    console.log(`  Cloudinary : ${process.env.CLOUDINARY_CLOUD_NAME ? '✓ configured' : '✗ not set'}`);
    console.log(`  FE_URL     : ${process.env.FE_URL || '(default)'}`);
    console.log(`==========================================\n`);
  });
};

startServer().catch(err => {
  console.error('[Fatal]', err.stack);
  process.exit(1);
});
