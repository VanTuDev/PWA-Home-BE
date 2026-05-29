import { Server } from 'socket.io';

const onlineSockets = new Set();
let _io = null;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Add to online client list
    onlineSockets.add(socket.id);
    console.log(`[Socket.io] New client connected: ${socket.id} (Online users: ${onlineSockets.size})`);

    // Notify all admin sockets that the count updated
    io.emit('online_count_update', onlineSockets.size);

    // Listen for client entering support chat room
    socket.on('join_support', (data) => {
      console.log(`[Socket.io] User ${data?.username || 'Guest'} joined support chat.`);
      socket.emit('message', {
        id: 'welcome',
        sender: 'system',
        text: 'Kết nối với hỗ trợ viên PAW Home thành công! Bạn có thể gửi tin nhắn để trò chuyện với admin.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Listen for incoming messages from client
    socket.on('send_message', (data) => {
      console.log(`[Socket.io] Message from ${data.sender || 'User'}: ${data.text}`);
      
      // Echo user message back to confirm receipt
      socket.emit('message', {
        id: Date.now().toString(),
        sender: 'user',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Simulate a smart, responsive Admin Agent typing and answering in 1.5 seconds
      setTimeout(() => {
        let replyText = 'Chào bạn! Cảm ơn bạn đã nhắn tin cho PAW Home. Hỗ trợ viên của trạm sẽ trả lời bạn ngay bây giờ! 🐾';
        
        const lowerText = data.text.toLowerCase();
        if (lowerText.includes('milo') || lowerText.includes('nhận nuôi')) {
          replyText = 'Các bé thú cưng tại trạm đều rất mong chờ tổ ấm mới! Bạn vui lòng điền vào "Đơn nhận nuôi" trực tuyến của bé để chúng mình xét duyệt hồ sơ nhé. ❤️';
        } else if (lowerText.includes('đóng góp') || lowerText.includes('donate') || lowerText.includes('quyên góp')) {
          replyText = 'Sự đóng góp của bạn giúp trạm có thêm kinh phí chữa trị và mua thức ăn cho các bé. Bạn có thể nhấn nút "Quyên góp" ở trang chủ để đóng góp nha! 🙏';
        } else if (lowerText.includes('địa chỉ') || lowerText.includes('trạm')) {
          replyText = 'PAW Home ở quận Ba Đình, Hà Nội. Trạm luôn mở cửa chào đón các bạn đến giao lưu và bế các bé mỗi cuối tuần! 🐕';
        }

        socket.emit('message', {
          id: (Date.now() + 1).toString(),
          sender: 'admin',
          senderName: 'Hỗ trợ viên PAW',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 1500);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      onlineSockets.delete(socket.id);
      console.log(`[Socket.io] Client disconnected: ${socket.id} (Online users: ${onlineSockets.size})`);
      io.emit('online_count_update', onlineSockets.size);
    });
  });

  _io = io;
  return io;
};

export const getOnlineUsersCount = () => onlineSockets.size;

export const broadcastNewOrder = (orderData) => {
  if (_io) _io.emit('new_order', orderData);
};
