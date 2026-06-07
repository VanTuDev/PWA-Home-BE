import { Server } from 'socket.io';
import ChatMessage from '../models/ChatMessage.js';

const onlineSockets = new Set();
let _io = null;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => cb(null, true),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    onlineSockets.add(socket.id);
    io.emit('online_count_update', onlineSockets.size);

    // ─── USER CHAT ─────────────────────────────────────────────────────────
    socket.on('join_user_chat', ({ userId }) => {
      if (!userId) return;
      socket.data.userId = userId;
      socket.data.role   = 'user';
      const room = `chat:${userId}`;
      const prevRoom = socket.data.room;
      if (prevRoom && prevRoom !== room) socket.leave(prevRoom);
      socket.join(room);
      socket.data.room = room;
      console.log(`[Socket] User ${userId} joined room ${room}`);
    });

    socket.on('user_message', async ({ content }) => {
      const userId = socket.data.userId;
      if (!userId || !content?.trim()) return;
      try {
        const msg = await ChatMessage.create({
          roomId: userId, senderId: userId,
          content: content.trim(), isFromAdmin: false, isRead: false,
        });
        const payload = { id: msg._id, content: msg.content, isFromAdmin: false, createdAt: msg.createdAt };
        io.to(`chat:${userId}`).emit('new_message', payload);
        io.to('admin_room').emit('user_new_message', { userId, content: content.trim(), at: msg.createdAt });
      } catch (err) {
        console.error('[Socket] user_message error:', err.message);
      }
    });

    // ─── ADMIN CHAT ────────────────────────────────────────────────────────
    socket.on('join_admin', () => {
      socket.data.role = 'admin';
      socket.join('admin_room');
      console.log(`[Socket] Admin joined admin_room (socket: ${socket.id})`);
    });

    socket.on('admin_open_chat', ({ userId }) => {
      if (socket.data.role !== 'admin' || !userId) return;
      socket.join(`chat:${userId}`);
      socket.data.openUserId = userId;
    });

    socket.on('admin_message', async ({ userId, content, adminId, adminName }) => {
      if (socket.data.role !== 'admin' || !userId || !content?.trim()) return;
      try {
        const msg = await ChatMessage.create({
          roomId: userId, senderId: adminId || 'admin',
          content: content.trim(), isFromAdmin: true, isRead: false,
        });
        const payload = {
          id: msg._id, content: msg.content,
          isFromAdmin: true, adminName: adminName || 'Admin', createdAt: msg.createdAt,
        };
        io.to(`chat:${userId}`).emit('new_message', payload);
      } catch (err) {
        console.error('[Socket] admin_message error:', err.message);
      }
    });

    // ─── DISCONNECT ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineSockets.delete(socket.id);
      io.emit('online_count_update', onlineSockets.size);
    });
  });

  _io = io;
  return io;
};

export const getOnlineUsersCount = () => onlineSockets.size;

export const broadcastNewOrder = (orderData) => {
  if (_io) _io.to('admin_room').emit('new_order', orderData);
};
